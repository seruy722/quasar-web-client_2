import { defineStore } from "pinia";
import { axiosInstance } from "boot/axios";
import { getUrl } from "src/tools/url";

export const useTransportStore = defineStore("transport", {
  state: () => ({
    transports: [],
    transport: {},
  }),

  getters: {
    getTransports(state) {
      return state.transports;
    },
  },

  actions: {
    async fetchTransports() {
      return await axiosInstance
        .get(getUrl("transports"))
        .then(({ data: { transports } }) => {
          this.transports = transports;
        })
        .catch((errors) => {
          console.error(errors);
        });
    },
    setTransport(data) {
      this.transport = data;
    },
  },
});
