import setupConfig from "./lib/config";
import setupLog from "./lib/log";
import setupDb, { updateFoundFeed } from "./lib/db";
import setupQueues, { queues, queueStats, clearQueues, pauseQueues, startQueues } from "./lib/queues";
import { queryAllHistory, scanUrl } from "./historyScan";

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

  browserAction.onClicked.addListener(() => {
    // TODO: detect existing tab and make active instead of creating
    // see - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getViews
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });

  db = await setupDb(config, true);
  setupQueues(config);
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
  handler({ port, id, message, type, data }).catch(err => log.error(err));
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
  startHistoryScan: async () => {
    const items = await queryAllHistory({
      maxResults: 10000,
      maxAge: 1000 * 60 * 60 * 24 * 14
    });
    items.forEach(({ url }) => {
      queues.discovery.add(() => scanUrl({ db, url }));
    });
  },
  default: async ({ port, id, message }) =>
    log.warn("Unimplemented message", message)
};

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
