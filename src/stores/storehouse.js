import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { setFormatedDate } from "src/utils/FrequentlyCalledFunctions";
import { findIndex, forEach } from "lodash";

export const useStorehouseStore = defineStore("storehouse", {
  state: () => ({
    storehouseData: [],
    storehouseCategoriesData: [],
  }),

  getters: {
    getStorehouseData(state) {
      return state.storehouseData;
    },
    getStorehouseCategoriesData(state) {
      return state.storehouseCategoriesData;
    },
  },

  actions: {
    async fetchStorehouseTableData() {
      return await axiosInstance
        .get(`${getUrl("storehouseData")}/${1}`)
        .then(({ data }) => {
          this.storehouseData = setFormatedDate(data, ["created_at"]);
        })
        .catch(() => {
          console.warn("Ошибка при запросе fetchStorehouseTableData");
        });
    },
    setStorehouseCategoriesData(data) {
      this.storehouseCategoriesData = data;
    },
    addToStorehouseData(entry) {
      this.storehouseData.unshift(entry);
    },
    updateStorehouseData(entry) {
      const itemIndex = findIndex(this.storehouseData, { id: entry.id });
      if (itemIndex !== -1) {
        this.storehouseData.splice(itemIndex, 1, entry);
      }
    },
    destroyStorehouseData(arr) {
      forEach(arr, (id) => {
        const itemIndex = findIndex(this.storehouseData, { id });
        if (itemIndex !== -1) {
          this.storehouseData.splice(itemIndex, 1);
        }
      });
    },
  },
});
