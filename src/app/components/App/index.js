import React, { Component } from "react";
import { connect } from "react-redux";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../store";

import { desc } from "../../../lib/misc.js";
import setupLog from "../../../lib/log.js";

// eslint-disable-next-line no-unused-vars
const log = setupLog("components/App");

import "./index.less";

export const App = ({
  startHistoryScan,
  setQueueConcurrency,
  clearQueues,
  pauseQueues,
  startQueues,
  feeds,
  stats,
  isLoaded
}) => {
  const feedsSorted = Object.values(feeds())
    .filter(item => item.count > 2)
    .sort((a, b) => desc(a.count, b.count));
  return (
    <div>
      <h1>Feed Herder</h1>
      <p>{JSON.stringify(stats())}</p>
      <p>
        <button onClick={startHistoryScan}>Start history scan</button>
        <button onClick={pauseQueues}>Pause</button>
        <button onClick={startQueues}>Start</button>
        <button onClick={clearQueues}>Clear</button>
        <input type="input" onChange={ev => setQueueConcurrency(ev.target.value)} defaultValue="16" />
      </p>
      {!isLoaded() && <p>Loading...</p>}
      {isLoaded() && (
        <ul>
          {feedsSorted.map((feed, idx) => (
            <Feed {...feed} key={idx} />
          ))}
        </ul>
      )}
    </div>
  );
};

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  handleExpand = () => this.setState({ expanded: !this.state.expanded });

  render() {
    const { href, title, count, sources } = this.props;
    const { expanded } = this.state;
    return (
      <li>
        <p>
          <button onClick={this.handleExpand}>{expanded ? "-" : "+"}</button>{" "}
          <a href={href}>{title || href}</a> ({count})
        </p>
        {expanded && (
          <ul>
            {Object.entries(sources).map(([url, { count, title }], idx) => (
              <li key={idx}>
                <a href={url}>{title || url}</a> ({count})
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }
}

export default connect(
  mapSelectorsToStateProps,
  mapActionsToDispatchProps
)(App);
