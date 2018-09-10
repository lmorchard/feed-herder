import setupConfig from "./lib/config";
import setupLog from "./lib/log";
import setupDb, { feedId, updateFoundFeed } from "./lib/db";

const { browserAction, tabs, runtime } = browser;

const config = setupConfig(process.env);
const log = setupLog("background");

let db;
let stats = {};

const ports = {
  appPage: {},
  feedDetect: {}
};

async function init() {
  log.debug("init()");

  db = await setupDb(config, true);

  browserAction.onClicked.addListener(() => {
    // TODO: detect existing tab and make active instead of creating
    // see - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getViews
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });

  runtime.onConnect.addListener(handleConnect);

  setInterval(updateStats, 1000);
}

const postMessage = (port, type, data) => port.postMessage({ type, data });

const broadcastMessage = (name, type, data) =>
  Object.values(ports[name])
    .forEach(port => postMessage(port, type, data));

function updateStats() {
  stats.time = Date.now();
  broadcastMessage("appPage", "updateStats", stats);
}

function handleConnect(port) {
  const id = port.sender.tab.id;
  
  log.debug("port connected", port.name, id);
  ports[port.name][id] = port;

  port.onMessage.addListener(message =>
    handleMessage({ port, message }));
  
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
  startHistoryScan: async () => {
    stats.scans = (stats.scans || 0) + 1 
  },
  default: async ({ port, id, message }) =>
    log.warn("Unimplemented message", message)
};

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
