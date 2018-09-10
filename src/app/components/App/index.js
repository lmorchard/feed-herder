import React from "react";
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

export const App = ({ feeds, stats, isLoaded }) => {
  const feedsSorted = Object.entries(feeds()).sort((a, b) =>
    desc(a[1].count, b[1].count)
  );
  return (
    <div>
      <h1>Feed Herder</h1>
      <p>{JSON.stringify(stats())}</p>
      {!isLoaded() && <p>Loading...</p>}
      {isLoaded() && (
        <ul>
          {feedsSorted.map(([_id, { href, title, count, sources }], idx) => (
            <li key={idx}>
              <p><a href={href}>{title || href}</a> ({count})</p>
              <ul>
                {Object.entries(sources).map(([ url, { count, title }], idx) => (
                  <li key={idx}><a href={url}>{ title || url }</a> ({count})</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default connect(
  mapSelectorsToStateProps,
  mapActionsToDispatchProps
)(App);
