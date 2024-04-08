import { defineStore } from "pinia";
import { isEmpty } from "lodash";
import { axiosInstance } from "boot/axios";
import { getUrl } from "src/tools/url";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    toPath: "",
    usersWithRolesAndPermissions: [],
    usersList: [],
  }),

  getters: {
    getUser(state) {
      return state.user;
    },
    isUserAuth(state) {
      return !isEmpty(state.user);
    },
    getToPath(state) {
      return state.toPath;
    },
    getUsersWithRolesAndPermissions(state) {
      return state.usersWithRolesAndPermissions;
    },
    getUsersList(state) {
      return state.usersList;
    },
  },

  actions: {
    setUser(data) {
      this.user = data;
    },
    async getUserModel() {
      return await axiosInstance.get(getUrl("userModel")).then(({ data }) => {
        this.user = data;
      });
    },
    setToPath(path) {
      this.toPath = path;
    },
    logout() {
      this.user = null;
      this.toPath = null;
    },
    setUsersWithRolesAndPermissions(array) {
      this.usersWithRolesAndPermissions = array;
    },
    async fetchUsersList() {
      return await axiosInstance.get(getUrl("usersList")).then(({ data }) => {
        this.usersList = data;
      });
    },
    removeUserData() {
      this.user = null;
      this.toPath = "";
      this.usersWithRolesAndPermissions = [];
    },
  },
});
