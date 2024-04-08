import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [],
  }),

  getters: {
    getCategories(state) {
      return state.categories;
    },
  },

  actions: {
    async fetchCategories() {
      return await axiosInstance
        .get(getUrl("categories"))
        .then(({ data: { categories } }) => {
          this.categories = categories;
        })
        .catch(() => {
          console.warn("Ошибка при запросе getCategories");
        });
    },
    addCategory(category) {
      this.categories.push(category);
    },
  },
});
