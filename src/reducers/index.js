import { combineReducers } from "redux";
import metadata from "./metadata";
import tree from "./tree";
import frequencies from "./frequencies";
import entropy from "./entropy";
import signatures from "./signatures";
import controls from "./controls";
import browserDimensions from "./browserDimensions";
import notifications from "./notifications";
import narrative from "./narrative";
import treeToo from "./treeToo";
import general from "./general";
import jsonCache from "./jsonCache";
import measurements from "./measurements";

const rootReducer = combineReducers({
  metadata,
  tree,
  frequencies,
  controls,
  entropy,
  signatures,
  browserDimensions,
  notifications,
  narrative,
  treeToo,
  general,
  jsonCache,
  measurements
});

export default rootReducer;
