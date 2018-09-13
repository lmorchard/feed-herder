import setupLog from "./lib/log";
import { findFeeds } from "./lib/feeds";
import { updateFoundFeed, queryFeedsBySource } from "./lib/db";

const log = setupLog("historyScan");

const { history } = browser;

const DEFAULT_MAX_RESULTS = 100000;
const DEFAULT_MAX_AGE = 1000 * 60 * 60 * 24 * 180;

// TODO: Could use some pagination, maybe day-by-day going back into past
export async function queryAllHistory({
  maxResults = DEFAULT_MAX_RESULTS,
  maxAge = DEFAULT_MAX_AGE
}) {
  return history.search({
    text: "",
    startTime: new Date(Date.now() - maxAge),
    maxResults
  });
}

export async function scanUrl({ db, url, title = null, visitCount = 1 }) {
  log.debug("scanUrl", url);

  // Skip any URLs already identified as sources in feeds
  const existing = await queryFeedsBySource(db, url);
  if (existing.length > 0) { 
    log.debug("Skip scan for", url);
    return;
  }

  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const feeds = findFeeds(url, title || doc.title, doc);
  for (let feed of feeds) {
    updateFoundFeed(db, feed, visitCount);
  }
}
