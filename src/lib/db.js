import PouchDB from "pouchdb";

import setupLog from "./log";
const log = setupLog("lib/db");

export default async function(config, init = false) {
  log.debug("setupDb");

  const db = new PouchDB("feedherder");
  return db;
}

export const feedId = ({ href }) => `feed|${href}`;

export const queryFeeds = async db =>
  (await db.allDocs({
    include_docs: true,
    startkey: "feed|",
    endkey: "feed|\ufff0"
  })).rows.map(row => row.doc);

export async function updateFoundFeed(db, { title, href, source, sourceTitle }) {
  const _id = feedId({ href });

  let record;
  try {
    record = await db.get(_id);
  } catch (e) {
    record = { _id, href, type: "feed", count: 0, sources: {} };
  }

  record.title = title;
  record.count++;
  if (record.sources[source]) {
    record.sources[source].title = sourceTitle;
    record.sources[source].count++;
  } else {
    record.sources[source] = {
      title: sourceTitle,
      count: 1
    };
  }

  try {
    const result = await db.put(record);
    log.info("Updated feed", record, result);
  } catch (e) {
    log.error("Feed update failure", e, record);
  }
}
