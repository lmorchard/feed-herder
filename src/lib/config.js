export default function({ NODE_ENV, LOG_LEVEL = null }) {
  const isDev = NODE_ENV === "development";
  const defaultLogLevel = isDev ? "debug" : "warn";

  return {
    NODE_ENV,
    LOG_LEVEL: LOG_LEVEL ? LOG_LEVEL : defaultLogLevel
  };
}
