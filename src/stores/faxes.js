import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { setFormatedDate } from "src/utils/FrequentlyCalledFunctions";
import { findIndex, forEach, isEmpty } from "lodash";

export const useFaxesStore = defineStore("faxes", {
  state: () => ({
    faxes: [],
    faxData: [],
    currentFaxItem: {},
    faxCategoriesData: [],
  }),

  getters: {
    getFaxes(state) {
      return state.faxes;
    },
    getCurrentFaxItem(state) {
      return state.currentFaxItem;
    },
    getFaxData(state) {
      return state.faxData;
    },
    getFaxCategoriesData(state) {
      return state.faxCategoriesData;
    },
  },

  actions: {
    async fetchFaxes() {
      return await axiosInstance
        .get(getUrl("faxes"))
        .then(({ data: { faxesList } }) => {
          this.faxes = setFormatedDate(faxesList, [
            "departure_date",
            "arrival_date",
            "created_at",
          ]);
        })
        .catch(() => {
          console.warn("Ошибка при запросе fetchFaxes");
        });
    },
    addFax(data) {
      if (isEmpty(this.faxes)) {
        this.faxes.push(data);
      } else {
        this.faxes.unshift(data);
      }
    },
    updateFax(data) {
      const index = findIndex(this.faxes, { id: data.id });
      if (index !== -1) {
        this.faxes.splice(index, 1, data);
      }
    },
    deleteFaxes(data) {
      forEach(data, (id) => {
        const index = findIndex(this.faxes, { id });
        if (index !== -1) {
          this.faxes.splice(index, 1);
        }
      });
    },
    deleteEntryFromFaxData(data) {
      forEach(data, (id) => {
        const index = findIndex(this.faxData, { id });
        if (index !== -1) {
          this.faxData.splice(index, 1);
        }
      });
    },
    setCurrentFaxItem(data) {
      this.currentFaxItem = data;
    },
    setFaxData(data) {
      this.faxData = data;
    },
    updateFaxData(data) {
      const index = findIndex(this.faxData, { id: data.id });
      if (index !== -1) {
        this.faxData.splice(index, 1, data);
      }
    },
    setFaxCategoriesData(data) {
      this.faxCategoriesData = data;
    },
  },
});
