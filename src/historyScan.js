const { history } = browser;

const DEFAULT_MAX_RESULTS = 100000;
const DEFAULT_MAX_AGE = 1000 * 60 * 60 * 24 * 180;

// TODO: Could use some pagination, maybe day-by-day going back into past
export async function queryAllHistory({
  maxResults = DEFAULT_MAX_RESULTS,
  maxAge = DEFAULT_MAX_AGE
}) {
  return history.search({
    text: "",
    startTime: new Date(Date.now() - maxAge),
    maxResults
  });
}

/*
fetch(things[10000].url).then(response => Promise.all([ response.status, response.text() ])).then(([status, text]) => { console.log(status, text); const parser = new DOMParser(); const doc = parser.parseFromString(text, "text/html"); window.thingDoc = doc.head.querySelectorAll('link[type*="rss"], link[type*="atom"], link[type*="rdf"]'); console.log(window.thingDoc) })

*/
