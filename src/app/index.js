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

const log = setupLog("app/index");

async function init() {
  log.debug("init() start");

  const config = setupConfig(process.env);

  const store = setupStore();
  renderApp(store);

  const db = await setupDb(config, true);
  await loadFeeds(store, db);
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

function setupStore() {
  const composeEnhancers = composeWithDevTools({});
  const initialState = {};
  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(promiseMiddleware))
  );
}

function renderApp(store) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  render(
    <Provider store={store}>
      <App {...{}} />
    </Provider>,
    root
  );
}

init()
  .then(() => log.debug("init() end"))
  .catch(err => log.error("init() error", err));
