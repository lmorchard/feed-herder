import PouchDB from "pouchdb";

import setupLog from "./log";

export default async function(config, init = false) {
  const log = setupLog("lib/db");

  log.debug("setupDb");

  const db = new PouchDB("feedherder");

  return db;
}

export const feedId = ({ href }) => `feed|${href}`;
