import setupConfig from "./lib/config";
import setupLog from "./lib/log";
import setupDb, { feedId } from "./lib/db";

const { browserAction, tabs, runtime } = browser;

const config = setupConfig(process.env);
const log = setupLog("background");

let db;

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
}

function handleConnect(port) {
  port.onMessage.addListener(message => handleMessage({ port, message }));
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
      updateFoundFeed(feed);
    }
  },
  default: async ({ port, id, message }) =>
    log.warn("Unimplemented message", message)
};

async function updateFoundFeed({ title, href, source, sourceTitle }) {
  const _id = feedId({ href });

  let record;
  try {
    record = await db.get(_id);
  } catch (e) {
    record = { _id, href, type: "feed", count: 0, sources: {} };
  }

  record.title = title;
  record.count++;
  if (record.sources[source]) {
    record.sources[source].title = sourceTitle;
    record.sources[source].count++;
  } else {
    record.sources[source] = {
      title: sourceTitle,
      count: 1
    };
  }

  try {
    const result = await db.put(record);
    log.info("Updated feed", record, result);
  } catch (e) {
    log.error("Feed update failure", e, record);
  }
}

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
