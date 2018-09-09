console.log("Hello world");

const { browserAction, tabs } = browser;

function init() {
  console.log("HELLO WORLD");
  browserAction.onClicked.addListener(() => {
    console.log("BROWSER ACTION CLICKED");
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });
}

init();
