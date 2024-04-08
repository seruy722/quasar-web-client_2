import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
// import { sortArrayCollection } from 'src/utils/sort';
// import { setFormatedDate } from 'src/utils/FrequentlyCalledFunctions';

export const fetchPermissions = ({ commit }) =>
  axiosInstance
    .get(getUrl("permissionList"))
    .then(({ data }) => {
      commit("SET_PERMISSIONS", data);
    })
    .catch((e) => {
      console.error("Ошибка запроса - fetchRoles", e);
    });

export const addPermission = ({ commit }, role) => {
  commit("ADD_PERMISSION", role);
};

export const deletePermission = ({ commit }, id) => {
  commit("DELETE_PERMISSION", id);
};
