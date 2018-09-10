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

export const App = ({ feeds }) => {
  const feedsSorted = Object.entries(feeds()).sort((a, b) =>
    desc(a[1].count, b[1].count)
  );

  return (
    <div>
      <h1>Hello world</h1>
      <ul>
        {feedsSorted.map(([_id, { href, title, count }], idx) => (
          <li key={idx}>
            <a href={href}>{title || href}</a> ({count})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default connect(
  mapSelectorsToStateProps,
  mapActionsToDispatchProps
)(App);
