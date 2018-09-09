import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";

import { rootReducer /* , actions, selectors */ } from "./store";

import "./index.less";

import App from "./components/App";

function init() {
  console.log("HELLO WORLD");
  const store = setupStore();
  renderApp(store);
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

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const initialState = {};

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(promiseMiddleware))
  );
}

init();
