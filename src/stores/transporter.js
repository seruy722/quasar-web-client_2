import { defineStore } from "pinia";
import { axiosInstance } from "boot/axios";
import { getUrl } from "src/tools/url";

export const useTransporterStore = defineStore("transporter", {
  state: () => ({
    transporters: [],
    transporter: {},
    transporterPrice: [],
  }),

  getters: {
    getTransporters(state) {
      return state.transporters;
    },
    getTransporterPrice(state) {
      return state.transporterPrice;
    },
  },

  actions: {
    async fetchTransporters() {
      return await axiosInstance
        .get(getUrl("transporters"))
        .then(({ data: { transporters } }) => {
          this.transporters = transporters;
        })
        .catch((errors) => {
          console.error(errors);
        });
    },
    setTransporterPrice(data) {
      this.transporterPrice = data;
    },
    addTransporter(transporter) {
      this.transporters.push(transporter);
    },
    setTransporter(data) {
      this.transporter = data;
    },
  },
});
