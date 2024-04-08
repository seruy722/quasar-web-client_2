import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
// import { sortArrayCollection } from 'src/utils/sort';
// import { setFormatedDate } from 'src/utils/FrequentlyCalledFunctions';

export const fetchRoles = ({ commit }) =>
  axiosInstance
    .get(getUrl("rolesList"))
    .then(({ data }) => {
      commit("SET_ROLES", data);
    })
    .catch((e) => {
      console.error("Ошибка запроса - fetchRoles", e);
    });

export const addRole = ({ commit }, role) => {
  commit("ADD_ROLE", role);
};

export const deleteRole = ({ commit }, id) => {
  commit("DELETE_ROLE", id);
};
