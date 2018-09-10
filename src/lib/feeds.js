// TODO: Refine this naive feed discovery
export const findFeeds = document =>
  Array.from(
    document.head.querySelectorAll(
      'link[type*="rss"], link[type*="atom"], link[type*="rdf"]'
    )
  ).map(link => ({
    title: link.getAttribute("title"),
    sourceTitle: document.title,
    source: window.location.toString(),
    href: new URL(link.getAttribute("href"), window.location).toString()
  }));

