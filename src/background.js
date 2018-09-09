import PouchDB from "pouchdb";

const { browserAction, tabs, runtime } = browser;

const ports = {};

async function init() {
  console.log("HELLO WORLD");

  const db = new PouchDB("feedherder");

  try {
    const result = await db.put({
      _id: "foo",
      title: "foo",
      thing: "where"
    });
    console.log("RESULT", result);
  } catch (err) {
    console.log("ERR", err);
  }

  browserAction.onClicked.addListener(() => {
    console.log("BROWSER ACTION CLICKED");
    tabs.create({
      active: true,
      url: "/app/index.html"
    });
  });

  runtime.onConnect.addListener(handleConnect);
  runtime.onDisconnect.addListener(handleDisconnect);
}

function handleConnect(port) {
  const id = port.sender.tab.id;
  ports[id] = port;
  port.onMessage.addListener(message => handleMessage({ id, port, message }));

  port.postMessage({
    type: "hello",
    data: "hi from background"
  });
}

function handleMessage({ id, port, message }) {
  console.log("BACKGROUND RECEIVED MESSAGE", { id, message });
}

function handleDisconnect(port) {
  const id = port.sender.tab.id;
  delete ports[id];
}

init().then(() => {
  console.log("init() complete");
});
