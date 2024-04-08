import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { findIndex } from "lodash";

export const usePermissionsStore = defineStore("permissions", {
  state: () => ({
    permissions: [],
  }),

  getters: {
    getPermissions(state) {
      return state.permissions;
    },
  },

  actions: {
    async fetchPermissions() {
      return await axiosInstance
        .get(getUrl("permissionList"))
        .then(({ data }) => {
          this.permissions = data;
        })
        .catch((e) => {
          console.error("Ошибка запроса - fetchRoles", e);
        });
    },
    addPermission(data) {
      this.permissions.unshift(data);
    },
    deletePermission(id) {
      const index = findIndex(this.permissions, { id });
      if (index !== -1) {
        this.permissions.splice(index, 1);
      }
    },
  },
});
