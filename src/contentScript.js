import setupLog from "./lib/log";
import { findFeeds } from "./lib/feeds";

const { runtime } = browser;

const log = setupLog("contentScript");

let port = null;

function init() {
  // TODO: switch from port to just one-way message to background?
  // depends on if this contentScript ever does anything else in content
  port = runtime.connect({ name: "feedDetect" });
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
  log("Unimplemented message", JSON.stringify({ message }, null, " "));
}

init();
