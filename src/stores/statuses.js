import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useStatusesStore = defineStore("statuses", {
  state: () => ({
    statuses: [],
  }),

  getters: {
    getStatuses(state) {
      return state.statuses;
    },
  },

  actions: {
    async fetchStatuses() {
      return await axiosInstance.get(getUrl("getStatuses")).then(({ data }) => {
        this.statuses = data;
      });
    },
  },
});
