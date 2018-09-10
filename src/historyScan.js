/*
 browser.history.search({ text: "", startTime: "2018-01-01T12:00:00Z", maxResults: 100000 }).then(result => { window.things = result; console.log(result.length) }); console.log("GO GO GO");

fetch(things[10000].url).then(response => Promise.all([ response.status, response.text() ])).then(([status, text]) => { console.log(status, text); const parser = new DOMParser(); const doc = parser.parseFromString(text, "text/html"); window.thingDoc = doc.head.querySelectorAll('link[type*="rss"], link[type*="atom"], link[type*="rdf"]'); console.log(window.thingDoc) })

*/
