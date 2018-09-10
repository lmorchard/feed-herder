const { combineReducers } = require("redux");
const {
  createActions,
  /* combineActions, */
  handleActions
} = require("redux-actions");

const actions = createActions(
  {},
  "setLoaded",
  "loadFeeds",
  "deleteFeed",
  "updateFeed"
);

const selectors = {
  feeds: state => state.feeds.feeds,
  isLoaded: state => state.ui.loaded
};

const rootReducer = combineReducers({
  feeds: handleActions(
    {
      [actions.loadFeeds]: (state, { payload: feeds }) => ({
        ...state,
        feeds: feeds.reduce((acc, feed) => ({ ...acc, [feed._id]: feed }), {})
      }),
      [actions.updateFeed]: ({ feeds, ...state }, { payload: feed }) => ({
        ...state,
        feeds: { ...feeds, [feed._id]: feed }
      }),
      [actions.deleteFeed]: ({ feeds, ...state }, { payload: _id }) => {
        const newFeeds = { ...feeds };
        delete newFeeds[_id];
        return { ...state, feeds: newFeeds };
      }
    },
    {
      feeds: {}
    }
  ),
  ui: handleActions(
    {
      [actions.setLoaded]: (state, { payload: loaded }) => ({
        ...state,
        loaded
      })
    },
    {
      loaded: false
    }
  )
});

const mapActionsToDispatchProps = dispatch =>
  Object.entries(actions).reduce(
    (acc, [name, action]) => ({
      ...acc,
      [name]: (...args) => dispatch(action(...args))
    }),
    {}
  );

const mapSelectorsToStateProps = state =>
  Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({
      ...acc,
      [name]: () => selector(state)
    }),
    {}
  );

module.exports = {
  actions,
  selectors,
  rootReducer,
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
};
