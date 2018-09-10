import PouchDB from "pouchdb";

import setupLog from "./log";

export default async function(config, init = false) {
  const log = setupLog("lib/db");

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
