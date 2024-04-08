import { compact } from "lodash";
export const SET_SHOPS_LIST = (state, data) => {
  state.shopsList = compact(data);
};
