console.log("Hello world");

const { browserAction, tabs } = browser;

browserAction.onClicked.addListener(() => {
  console.log("BROWSER ACTION CLICKED");
  tabs.create({
    active: true,
    url: "/app/index.html"
  });
});
