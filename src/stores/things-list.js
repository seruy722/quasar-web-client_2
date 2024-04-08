import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { compact } from "lodash";

export const useThingsListStore = defineStore("thingsList", {
  state: () => ({
    thingsList: [],
  }),

  getters: {
    getThingsList(state) {
      return state.thingsList;
    },
  },

  actions: {
    async setThingsList(list) {
      if (list) {
        this.thingsList = list;
      } else {
        return await axiosInstance
          .get(getUrl("thingsList"))
          .then(({ data }) => {
            this.thingsList = compact(data);
          })
          .catch(() => {
            console.warn("Ошибка - setThingsList");
          });
      }
    },
  },
});
