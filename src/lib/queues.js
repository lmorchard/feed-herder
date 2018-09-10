const PQueue = require("p-queue");

import setupLog from "./log";

const log = setupLog("lib/queues");

export default async function setupQueues(config) {
  log.debug("setupQueues");

  const queues = {
    discovery: new PQueue({
      concurrency: 4
    }),
    fetch: new PQueue({
      concurrency: 4
    })
  };

  return { queues };
}

/*
class QueueClass {
  constructor() {
    this._queue = [];
  }
  enqueue(run, options) {
    this._queue.push(run);
  }
  dequeue() {
    return this._queue.shift();
  }
  get size() {
    return this._queue.length;
  }
}
*/
