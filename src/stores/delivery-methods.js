import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useDeliveryMethodsStore = defineStore("delivery-methods", {
  state: () => ({
    list: [],
  }),

  getters: {
    getDeliveryMethodsList(state) {
      return state.list;
    },
  },

  actions: {
    async fetchDeliveryMethodsList() {
      return await axiosInstance
        .get(getUrl("deliveryMethodsList"))
        .then(({ data }) => {
          data.unshift({
            label: "Не выбрано",
            value: 0,
          });
          this.list = data;
        })
        .catch(() => {
          console.error("Ошибка запроса - fetchDeliveryMethodsList");
        });
    },
  },
});
