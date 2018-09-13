import { scanUrl } from "../historyScan";
import setupLog from "./log";

const log = setupLog("lib/queues");

export const queues = {};

export default async function setupQueues(config, db) {
  log.debug("setupQueues");

  Object.assign(queues, {
    discovery: new QueueRunner({
      source: new InMemorySource(),
      concurrency: 16,
      onTask: async (task) => scanUrl({ db, ...task })
    }),
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

export class InMemorySource {
  constructor(data) {
    this.data = data || [];
  }
  async push(task) {
    this.data.push(task);
  }
  async pull() {
    return { done: this.empty, value: this.data.shift() };
  }
  async clear() {
    this.data.length = 0;
  }
  get size() {
    return this.data.length;
  }
  get empty() {
    return this.data.length === 0;
  }
}

export class QueueRunner {
  constructor({
    concurrency = 1,
    autoStart = true,
    source,
    onTask = null,
    onResolve = null,
    onReject = null,
    onEmpty = null,
    onDone = null
  }) {
    Object.assign(this, {
      concurrency,
      autoStart,
      source,
      nextTaskId: 0,
      isRunning: false,
      isEmpty: false,
      isDone: false,
      pendingTasks: {},
      onTask: onTask ? onTask : task => task,
      onResolve: onResolve ? onResolve : () => {},
      onReject: onReject ? onReject : () => {},
      onEmpty: onEmpty ? onEmpty : () => {},
      onDone: onDone ? onDone : () => {}
    });
    if (this.autoStart) {
      this.start();
    }
  }

  start() {
    if (this.isRunning) {
      return;
    }
    this.isEmpty = false;
    this.isDone = false;
    this.isRunning = true;
    this.next();
  }

  pause() {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
  }

  clear() {
    this.pause();
    this.source.clear();
  }

  async push(task) {
    return this.source.push(task);
  }

  get size() {
    return this.source.size;
  }

  get pending() {
    return Object.keys(this.pendingTasks).length;
  }

  async next() {
    if (!this.isRunning || this.pending >= this.concurrency) {
      return;
    }

    const { done, value: task } = await this.source.pull();

    if (done) {
      if (!this.isEmpty) {
        this.isEmpty = true;
        this.onEmpty();
      }
      if (this.pending === 0) {
        this.isRunning = false;
        this.onDone();
      }
      return;
    }

    const taskId = this.nextTaskId++;
    this.pendingTasks[taskId] = task;

    const complete = cb => result => {
      delete this.pendingTasks[taskId];
      cb(result, task, taskId);
      this.next();
    };

    this.onTask(task).then(
      complete(this.onResolve),
      complete(this.onReject)
    );

    this.next();
  }
}
