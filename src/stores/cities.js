import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useSitiesStore = defineStore("cities", {
  state: () => ({
    cities: [],
  }),

  getters: {
    getCities(state) {
      return state.cities;
    },
  },

  actions: {
    setCities() {
      const answer = axiosInstance.get(getUrl("cities"));
      answer
        .then(({ data }) => {
          this.cities = data;
        })
        .catch(() => {
          console.warn("Ошибка при запросе setCities");
        });

      return answer;
    },
  },
});
