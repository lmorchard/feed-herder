function init() {
  const source = new ArraySource(Object.values(states));

  const runner = new Runner({
    source,
    concurrency: 16,
    onTask: async task => {
      console.log(`START ${task}`);
      if (Math.random() < 0.1) {
        throw "YOW!";
      }
      await wait(500 + Math.random() * 500);
      return `TASK ${task}`;
    },
    onResolve: async (result, task, taskId) => {
      console.log(`FINISHED ${result} ${task} ${taskId}`);
    },
    onReject: async (error, task, taskId) => {
      console.log(`ERROR ${error} ${task} ${taskId}`);
    },
    onEmpty: async () => {
      console.log(`EMPTY ${source.count} ${Object.values(runner.pending)}`);
    },
    onDone: async () => {
      console.log(`DONE ${source.count} ${Object.values(runner.pending)}`);
    }
  });

  if (false) {
    const timer = setInterval(() => {
      if (runner.isDone) {
        clearInterval(timer);
        return;
      }
      if (Math.random() < 0.2) {
        if (runner.isRunning) {
          console.log("PAUSE");
          runner.pause();
        } else {
          console.log("START");
          runner.start();
        }
      }
    }, 200);
  }
}

const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

class ArraySource {
  constructor(data) {
    Object.assign(this, {
      data,
      empty: false,
      idx: 0
    });
  }
  get count() {
    return this.data.length - this.idx;
  }
  *items() {
    for (this.idx = 0; this.idx < this.data.length; this.idx++) {
      yield this.data[this.idx];
    }
    this.empty = true;
  }
}

class Runner {
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
      items: source.items(),
      nextTaskId: 0,
      isRunning: false,
      isEmpty: false,
      isDone: false,
      pending: {},
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
    this.isRunning = true;
    this.next();
  }

  pause() {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
  }

  get pendingCount() {
    return Object.keys(this.pending).length;
  }

  next() {
    if (!this.isRunning) {
      return;
    }

    if (this.pendingCount >= this.concurrency) {
      return;
    }

    const { done, value: task } = this.items.next();
    if (done) {
      if (!this.isEmpty) {
        this.isEmpty = true;
        this.onEmpty();
      }
      return;
    }

    const taskId = this.nextTaskId++;
    this.pending[taskId] = task;
    this.onTask(task).then(
      this._complete(task, taskId, this.onResolve),
      this._complete(task, taskId, this.onReject)
    );

    this.next();
  }

  _complete(task, taskId, cb) {
    return result =>
      Promise.resolve(cb(result, task, taskId)).then(() => {
        this.next();
        delete this.pending[taskId];
        if (this.isEmpty && this.pendingCount === 0) {
          this.isDone = true;
          this.onDone();
        }
      });
  }
}

const states = {
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FM: "Federated States Of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming"
};

init();
