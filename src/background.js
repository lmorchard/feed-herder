import setupConfig from "./lib/config";
import setupLog from "./lib/log";
import setupDb, { updateFoundFeed } from "./lib/db";
import setupQueues, {
  queues,
  queueStats,
  clearQueues,
  pauseQueues,
  startQueues
} from "./lib/queues";
import { queryAllHistory } from "./historyScan";

const { browserAction, tabs, runtime } = browser;

const config = setupConfig(process.env);
const log = setupLog("background");

let db;

const ports = {
  appPage: {},
  feedDetect: {}
};

async function init() {
  log.debug("init()");

  tabs.create({
    active: true,
    url: "/app/index.html"
  });

  browserAction.onClicked.addListener(() => {
    // TODO: detect existing tab and make active instead of creating
    // see - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getViews
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });

  db = await setupDb(config, true);
  setupQueues(config, db);
  runtime.onConnect.addListener(handleConnect);

  setInterval(updateStats, 500);
}

const postMessage = (port, type, data) => port.postMessage({ type, data });

const broadcastMessage = (name, type, data) =>
  Object.values(ports[name]).forEach(port => postMessage(port, type, data));

function updateStats() {
  broadcastMessage("appPage", "updateStats", {
    time: Date.now(),
    queue: queueStats()
  });
}

function handleConnect(port) {
  const id = port.sender.tab.id;

  log.debug("port connected", port.name, id);
  ports[port.name][id] = port;

  port.onMessage.addListener(message => handleMessage({ port, message }));

  port.onDisconnect.addListener(() => {
    delete ports[port.name][id];
    log.debug("port disconnected", port.name);
  });
}

function handleMessage({ port, message }) {
  const id = port.sender.tab.id;
  const { type, data } = message;
  const handler =
    type in messageTypes ? messageTypes[type] : messageTypes.default;
  handler({ port, id, message, type, data })
    .catch(err => log.error("message error", "" + err));
}

const messageTypes = {
  foundFeeds: async ({ data: feeds }) => {
    for (let feed of feeds) {
      updateFoundFeed(db, feed);
    }
  },
  startQueues: async () => startQueues(),
  pauseQueues: async () => pauseQueues(),
  clearQueues: async () => clearQueues(),
  setQueueConcurrency: async ({ data }) => {
    queues.discovery.concurrency = parseInt(data, 10) || 4;
  },
  startHistoryScan: async () => {
    log.debug("startHistoryScan");
    const items = await queryAllHistory({
      maxResults: 20000,
      maxAge: 1000 * 60 * 60 * 24 * 180
    });
    console.log("history", items.length);
    items.forEach(item => queues.discovery.push(item));
    queues.discovery.start();
  },
  default: async ({ port, id, message }) =>
    log.warn("Unimplemented message", message)
};

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
