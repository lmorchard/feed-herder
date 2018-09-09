const { runtime } = browser;

function init() {
  console.log("FEED HERDER CONTENT SCRIPT");

  const port = runtime.connect({ name: "feed-detect" });

  port.onMessage.addListener(handleMessage);

  port.postMessage({
    type: "hello",
    data: "hi from contentScript"
  });

  document.addEventListener("DOMContentLoaded", handleDOMLoaded);
}

function handleDOMLoaded() {
  // see also: https://github.com/davidhampgonsalves/foxish/blob/master/scripts/feed_finder.js#L19
  var result = document.evaluate(
      '//*[local-name()="link"][contains(@rel, "alternate")] ' +
      '[contains(@type, "rss") or contains(@type, "atom") or ' +
      'contains(@type, "rdf")]', document, null, 0, null);

  var feeds = [];
  var item;
  // eslint-disable-next-line no-cond-assign
  while (item = result.iterateNext()) {
    feeds.push({"href": item.href, "title": item.title});
  }

  console.log("DOCUMENT", JSON.stringify({ document, feeds }, null, " "));
}

function handleMessage(message) {
  console.log(
    "CONTENT SCRIPT RECEIVED MESSAGE",
    JSON.stringify({ message }, null, " ")
  );
}

init();
