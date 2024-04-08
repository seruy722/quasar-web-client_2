import { defineStore } from "pinia";
import { forEach, assign, orderBy, filter } from "lodash";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useStatisticsStore = defineStore("statistics", {
  state: () => ({
    statistics: [],
  }),

  getters: {
    getStatistics(state) {
      const arr = [];
      forEach(state.statistics.month, (item) => {
        const currentMonth = new Date(item.date).getMonth() + 1;
        const currentYear = new Date(item.date).getFullYear();
        const obj = assign({}, item);
        obj.date = new Date(item.date).toISOString().slice(0, 7);
        obj.data = orderBy(
          filter(
            state.statistics.statistics,
            (elem) =>
              currentMonth === new Date(elem.created_at).getMonth() + 1 &&
              currentYear === new Date(elem.created_at).getFullYear(),
          ),
          (elem) => new Date(elem.created_at),
          "desc",
        );
        arr.push(obj);
      });
      return arr;
    },
  },

  actions: {
    async fetchStatistics() {
      return await axiosInstance
        .get(getUrl("getStatistics"))
        .then(({ data }) => {
          this.statistics = data;
        });
    },
    addStatistic(data) {
      this.statistics.statistics.unshift(data);
    },
  },
});
