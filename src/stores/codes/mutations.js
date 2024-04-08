import { compact, uniq, map, find, toNumber, isEmpty, findIndex } from "lodash";
const setCitiesAndPhones = (obj, array) => {
  obj.cities = compact(uniq(map(array, "city_name")));
  obj.phones = compact(uniq(map(array, "phone")));
  return obj;
};
export const SET_CODES = (state, data) => {
  state.codes = data;
};

export const SET_CODES_WITH_CUSTOMERS = (state, data) => {
  state.codesWithCustomers = data;
};

export const ADD_CODE = (state, data) => {
  if (data.code) {
    state.codes.push(data.code);
  }

  if (data.codeWithCustomers) {
    state.codesWithCustomers.push(data.codeWithCustomers);
  }
};

export const ADD_CODE_TO_CODE_WITH_CUSTOMERS = (state, data) => {
  const findObj = find(state.codesWithCustomers, {
    id: toNumber(data.code_id),
  });
  if (findObj) {
    findObj.customers.push(data);
    setCitiesAndPhones(findObj, findObj.customers);
  }
};

export const UPDATE_CUSTOMER = (state, data) => {
  const findObj = find(state.codesWithCustomers, {
    id: toNumber(data.code_id),
  });

  if (findObj && !isEmpty(findObj.customers)) {
    const index = findIndex(findObj.customers, { id: data.id });
    if (index !== -1) {
      findObj.customers.splice(index, 1, data);
    } else {
      findObj.customers.push(data);
    }
  } else if (findObj) {
    findObj.customers.push(data);
  }
  if (findObj) {
    setCitiesAndPhones(findObj, findObj.customers);
  }
};

export const DELETE_CUSTOMER = (state, data) => {
  const findObj = find(state.codesWithCustomers, {
    id: toNumber(data.code_id),
  });
  if (findObj && !isEmpty(findObj.customers)) {
    const index = findIndex(findObj.customers, { id: data.id });
    if (index !== -1) {
      findObj.customers.splice(index, 1);
      setCitiesAndPhones(findObj, findObj.customers);
    }
  }
};

export const SET_CODES_ASSISTANT = (state, data) => {
  state.codes = data;
};
