import { compact } from "lodash";
export const SET_THINGS_LIST = (state, data) => {
  state.thingsList = compact(data);
};
