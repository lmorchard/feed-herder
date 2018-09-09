const { combineReducers } = require("redux");
const {
  createActions,
  /* combineActions, */
  handleActions
} = require("redux-actions");

const actions = createActions(
  {
  },
  "setLoaded"
);

const selectors = {
  isLoaded: state => state.ui.loaded
};

const rootReducer = combineReducers({
  ui: handleActions(
    {
      [actions.setLoaded]: (state, { payload: loaded }) =>
        ({ ...state, loaded })
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
