import { findIndex, forEach } from "lodash";
export const SET_QUESTIONS = (state, data) => {
  state.questions = data;
};
export const ADD_QUESTION = (state, data) => {
  state.questions.push(data);
};
export const UPDATE_QUESTION = (state, data) => {
  const index = findIndex(state.questions, { id: data.id });
  if (index !== -1) {
    state.questions.splice(index, 1, data);
  } else {
    state.questions.push(data);
  }
};
export const DELETE_QUESTIONS = (state, data) => {
  forEach(data, (id) => {
    const index = findIndex(state.questions, { id });
    if (index !== -1) {
      state.questions.splice(index, 1);
    }
  });
};
