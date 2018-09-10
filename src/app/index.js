import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";

import { rootReducer, actions } from "./store";

import setupConfig from "../lib/config";
import setupLog from "../lib/log";
import setupDb, { queryFeeds } from "../lib/db";

import "./index.less";

import App from "./components/App";

const { runtime } = browser;

const log = setupLog("app/index");

async function init() {
  log.debug("init() start");

  const config = setupConfig(process.env);

  const store = setupStore();

  const port = setupPort(store);

  const db = await setupDb(config, true);
  await loadFeeds(store, db);

  renderApp({ config, port, store });
}

function setupStore() {
  const composeEnhancers = composeWithDevTools({});
  const initialState = {};
  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(promiseMiddleware))
  );
}

async function loadFeeds(store, db) {
  const feeds = await queryFeeds(db);
  store.dispatch(actions.loadFeeds(feeds));

  db.changes({ since: "now", live: true, include_docs: true })
    .on("change", change => {
      const { doc, id } = change;
      if (doc.type === "feed") {
        if (change.deleted) {
          store.dispatch(actions.deleteFeed(id));
        } else {
          store.dispatch(actions.updateFeed(doc));
        }
      }
    })
    .on("error", err => log.error("db.changes error", err));
}

const postMessage = (port, type, data) => port.postMessage({ type, data });

function setupPort(store) {
  const port = runtime.connect({ name: "appPage" });
  port.onMessage.addListener(message =>
    handleMessage({ store, port, message }));
  return port;
}

function handleMessage({ store, port, message }) {
  const { type, data } = message;
  const handler =
    type in messageTypes ? messageTypes[type] : messageTypes.default;
  handler({ store, port, message, type, data })
    .catch(err => log.error('handleMessage error', err));
}

const messageTypes = {
  updateStats: async ({ store, data: stats }) =>
    store.dispatch(actions.updateStats(stats)),
  default: async ({ port, message }) =>
    log.warn("Unimplemented message", message)
};

function renderApp({ config, port, store }) {
  const startHistoryScan = () => {
    postMessage(port, "startHistoryScan");
  };

  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  render(
    <Provider store={store}>
      <App {...{
        config,
        startHistoryScan,
      }} />
    </Provider>,
    root
  );
}

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
