import setupConfig from "./config";
const config = setupConfig(process.env);

export const logLevels = {
  quiet: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40
};

export default function(name) {
  const { LOG_LEVEL } = config;

  const level = logLevels[LOG_LEVEL] || logLevels.warn;

  const log = (...args) => console.log(`[feed-herder ${name}]`, ...args);

  log.error = (...args) => {
    if (level >= logLevels.error) {
      log("(error)", ...args);
    }
  };

  log.warn = (...args) => {
    if (level >= logLevels.warn) {
      log("(warn)", ...args);
    }
  };

  log.info = (...args) => {
    if (level >= logLevels.info) {
      log("(info)", ...args);
    }
  };

  log.debug = (...args) => {
    if (level >= logLevels.debug) {
      log("(debug)", ...args);
    }
  };

  return log;
}
