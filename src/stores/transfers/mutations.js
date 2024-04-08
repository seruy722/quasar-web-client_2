import { map, forEach, includes, findIndex } from "lodash";
export const SET_TRANSFERS = (state, data) => {
  state.transfers = data;
};

export const ADD_TRANSFERS = (state, data) => {
  const ids = map(state.transfers, "id");
  const arr = [];
  forEach(data, (item) => {
    if (includes(ids, item.id)) {
      const index = findIndex(state.transfers, { id: item.id });
      if (index !== -1) {
        state.transfers.splice(index, item);
      }
    } else {
      arr.push(item);
    }
  });
  state.transfers.push(...arr);
};

export const UPDATE_TRANSFERS = (state, data) => {
  const arr = [];
  forEach(data, (item) => {
    const index = findIndex(state.transfers, { id: item.id });
    if (index !== -1) {
      state.transfers.splice(index, 1, item);
    } else {
      arr.push(item);
    }
  });
  state.transfers.unshift(...arr);
};

export const ADD_TRANSFER = (state, elem) => {
  const index = findIndex(state.transfers, { id: elem.id });
  if (index === -1) {
    state.transfers.unshift(elem);
  }
};

export const UPDATE_TRANSFER = (state, elem) => {
  const index = findIndex(state.transfers, { id: elem.id });
  if (index !== -1) {
    state.transfers.splice(index, 1, elem);
  }
};

export const UPDATE_TRANSFER_CLIENT = (state, [elem]) => {
  const index = findIndex(state.transfersClient, { id: elem.id });
  state.transfersClient.splice(index, 1, elem);
};

export const ADD_TRANSFER_CLIENT = (state, [elem]) => {
  state.transfersClient.unshift(elem);
};

export const SET_TRANSFERS_CLIENT = (state, data) => {
  state.transfersClient = data;
};
