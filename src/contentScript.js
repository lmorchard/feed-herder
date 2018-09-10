import setupLog from "./lib/log";

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
  const feeds = findFeeds();
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

// TODO: Refine this naive feed discovery
const findFeeds = () =>
  Array.from(
    document.head.querySelectorAll(
      'link[type*="rss"], link[type*="atom"], link[type*="rdf"]'
    )
  ).map(link => ({
    title: link.getAttribute("title"),
    sourceTitle: document.title,
    source: window.location.toString(),
    href: new URL(link.getAttribute("href"), window.location).toString()
  }));

init();
