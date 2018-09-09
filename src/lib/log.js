export default function(name) {
  const log = (...args) => console.log(`[feed-herder ${name}]`, ...args);

  log.info = (...args) => {
    log("(info)", ...args);
  };

  log.debug = (...args) => {
    if (process.env.NODE_ENV === "development") {
      log("(debug)", ...args);
    }
  };

  log.warn = (...args) => {
    if (process.env.NODE_ENV === "development") {
      log("(warn)", ...args);
    }
  };

  log.error = (...args) => {
    if (process.env.NODE_ENV === "development") {
      log("(error)", ...args);
    }
  };

  return log;
}
