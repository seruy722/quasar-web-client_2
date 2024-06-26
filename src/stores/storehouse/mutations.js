import { findIndex, forEach } from "lodash";
export const SET_STOREHOUSE_DATA = (state, data) => {
  state.storehouseData = data;
};

export const SET_STOREHOUSE_CATEGORIES_DATA = (state, data) => {
  state.storehouseCategoriesData = data;
};

export const ADD_TO_STOREHOUSE_DATA = (state, entry) => {
  state.storehouseData.unshift(entry);
};

export const UPDATE_STOREHOUSE_DATA = (state, entry) => {
  const itemIndex = findIndex(state.storehouseData, { id: entry.id });
  if (itemIndex !== -1) {
    state.storehouseData.splice(itemIndex, 1, entry);
  }
};

export const DESTROY_STOREHOUSE_DATA = (state, arr) => {
  forEach(arr, (id) => {
    const itemIndex = findIndex(state.storehouseData, { id });
    if (itemIndex !== -1) {
      state.storehouseData.splice(itemIndex, 1);
    }
  });
};
