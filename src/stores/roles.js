import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { findIndex } from "lodash";

export const useRolesStore = defineStore("roles", {
  state: () => ({
    roles: [],
  }),

  getters: {
    getRoles(state) {
      return state.roles;
    },
  },

  actions: {
    async fetchRoles() {
      return await axiosInstance
        .get(getUrl("rolesList"))
        .then(({ data }) => {
          this.roles = data;
        })
        .catch((e) => {
          console.error("Ошибка запроса - fetchRoles", e);
        });
    },
    addRole(data) {
      this.roles.unshift(data);
    },
    deleteRole(id) {
      const index = findIndex(this.roles, { id });
      if (index !== -1) {
        this.roles.splice(index, 1);
      }
    },
  },
});
