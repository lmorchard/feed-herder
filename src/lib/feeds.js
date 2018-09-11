// TODO: Refine this naive feed discovery
export const findFeeds = (sourceUrl, sourceTitle, document) =>
  Array.from(
    document.head.querySelectorAll(
      'link[type*="rss"], link[type*="atom"], link[type*="rdf"]'
    )
  ).map(link => ({
    sourceUrl,
    sourceTitle,
    title: link.getAttribute("title"),
    href: new URL(link.getAttribute("href"), sourceUrl).toString()
  }));
