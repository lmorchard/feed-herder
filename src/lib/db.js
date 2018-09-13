import PouchDB from "pouchdb";

import setupLog from "./log";
const log = setupLog("lib/db");

let db;

export default async function(config, init = false) {
  log.debug("setupDb");
  db = new PouchDB("feedherder");
  return db;
}

export const getDb = () => db;

export const feedId = ({ href }) => `feed|${href}`;

export const queryFeeds = async db =>
  (await db.allDocs({
    include_docs: true,
    startkey: "feed|",
    endkey: "feed|\ufff0"
  })).rows.map(row => row.doc);

export const queryFeedsBySource = async (db, url) =>
  (await queryFeeds(db)).filter(record => url in record.sources);

export async function updateFoundFeed(
  db,
  { title, href, sourceUrl, sourceTitle },
  visitCount = 1
) {
  const _id = feedId({ href });

  let record;
  try {
    record = await db.get(_id);
  } catch (e) {
    record = { _id, href, type: "feed", count: 0, sources: {} };
  }

  const source =
    sourceUrl in record.sources
      ? record.sources[sourceUrl]
      : (record.sources[sourceUrl] = { count: 0 });

  record.title = title;
  record.count += visitCount;

  source.title = sourceTitle;
  source.count += visitCount;

  try {
    await db.put(record);
    log.info("Updated feed", record._id);
  } catch (e) {
    log.error("Feed update failure", e, record);
  }
}
