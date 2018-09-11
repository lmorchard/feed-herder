import { findFeeds } from "./lib/feeds";
import { updateFoundFeed } from "./lib/db";

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

export async function scanUrl({ db, url }) {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const feeds = findFeeds(url, doc.title, doc);
  for (let feed of feeds) {
    updateFoundFeed(db, feed);
  }
}
