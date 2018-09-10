import setupLog from "./lib/log";
import { findFeeds } from "./lib/feeds";

const { runtime } = browser;

const log = setupLog("contentScript");

let port = null;

function init() {
  port = runtime.connect({ name: "feed-detect" });
  port.onMessage.addListener(handleMessage);
  document.addEventListener("DOMContentLoaded", handleDOMLoaded);
}

const postMessage = (type, data) => port.postMessage({ type, data });

function handleDOMLoaded() {
  const feeds = findFeeds(document);
  if (feeds.length > 0) {
    postMessage("foundFeeds", feeds);
  }
}

function handleMessage(message) {
  log(
    "CONTENT SCRIPT RECEIVED MESSAGE",
    JSON.stringify({ message }, null, " ")
  );
}

init();
