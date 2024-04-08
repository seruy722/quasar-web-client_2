import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { compact } from "lodash";

export const useShopListStore = defineStore("shopList", {
  state: () => ({
    shopsList: [],
  }),

  getters: {
    getShopsList(state) {
      return state.shopsList;
    },
  },

  actions: {
    async setShopsList() {
      return await axiosInstance
        .get(getUrl("shopsList"))
        .then(({ data }) => {
          this.shopsList = compact(data);
        })
        .catch(() => {
          console.error("Ошибка запроса - setShopsList");
        });
    },
  },
});
