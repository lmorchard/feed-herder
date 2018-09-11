import PQueue from "p-queue";

import setupLog from "./log";

const log = setupLog("lib/queues");

export const queues = {};

export default async function setupQueues(config) {
  log.debug("setupQueues");
  Object.assign(queues, {
    discovery: new PQueue({
      concurrency: 2
    }),
    fetch: new PQueue({
      concurrency: 2
    })
  });
  return queues;
}

export const clearQueues = () =>
  Object.values(queues).forEach(queue => queue.clear());

export const pauseQueues = () =>
  Object.values(queues).forEach(queue => queue.pause());

export const startQueues = () =>
  Object.values(queues).forEach(queue => queue.start());

export const queueStats = () =>
  Object.entries(queues).reduce(
    (acc, [name, queue]) => ({
      ...acc,
      [name]: {
        size: queue.size,
        pending: queue.pending,
        isPaused: queue.isPaused
      }
    }),
    {}
  );

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
