import makeLog from "./lib/log";
import PouchDB from "pouchdb";

const { browserAction, tabs, runtime } = browser;

const log = makeLog("background");
let db;

async function init() {
  log.debug("init()");

  db = new PouchDB("feedherder");

  browserAction.onClicked.addListener(() => {
    // TODO: detect existing tab and make active instead of creating
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });

  runtime.onConnect.addListener(handleConnect);
}

function handleConnect(port) {
  port.onMessage.addListener(message => handleMessage({ port, message }));

  port.postMessage({
    type: "hello",
    data: "hi from background"
  });
}

function handleMessage({ port, message }) {
  const id = port.sender.tab.id;
  const { type, data } = message;
  const handler =
    type in messageHandlers ? messageHandlers[type] : messageHandlers.default;
  handler({ port, id, message, type, data }).then(() => {
    /* no-op */
  });
}

const messageHandlers = {
  foundFeeds: async ({ data: feeds }) => {
    for (let feed of feeds) {
      updateFoundFeed(feed);
    }
  },
  default: async ({ port, id, message }) =>
    log.warn("Unimplemented message", message)
};

async function updateFoundFeed({ title, source, href }) {
  let record;
  try {
    record = await db.get(href);
  } catch (e) {
    record = { _id: href, href, type: "feed", count: 0, sources: {} };
  }

  record.title = title;
  record.count++;
  record.sources[source] = 1 + (record.sources[source] || 0);

  try {
    const result = await db.put(record);
    log.info("Updated feed", record, result);
  } catch (e) {
    log.error("Feed update failure", e, record);
  }
}

init().then(() => log.debug("init() end"));
