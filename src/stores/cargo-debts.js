import { defineStore } from "pinia";
import { fullDate } from "src/utils/formatDate";
import { combineCargoData } from "src/utils/FrequentlyCalledFunctions";
import { map, orderBy, assign, findIndex, isArray, forEach } from "lodash";
import { axiosInstance } from "boot/axios";
import { getUrl } from "src/tools/url";

export const useCargoDebtsStore = defineStore("cargoDebts", {
  state: () => ({
    cargo: [],
    cargoForSearch: [],
    debts: [],
    debtsForSearch: [],
    currentCodeClientId: null,
    generalData: {},
  }),

  getters: {
    getCargo(state) {
      return map(
        orderBy(
          combineCargoData(state.cargo),
          (item) => new Date(item.created_at),
          "desc",
        ),
        (item) =>
          assign({}, item, {
            created_at: fullDate(item.created_at),
            chang: item.created_at,
          }),
      );
    },
    getCurrentCodeClientId(state) {
      return state.currentCodeClientId;
    },
    getDebts(state) {
      return map(
        orderBy(state.debts, (item) => new Date(item.created_at), "desc"),
        (item) =>
          assign({}, item, {
            created_at: fullDate(item.created_at),
            chang: item.created_at,
          }),
      );
    },
    getCargoForSearch(state) {
      return state.cargoForSearch;
    },
    getDebtsForSearch(state) {
      return state.debtsForSearch;
    },
    getGeneralData(state) {
      return state.generalData;
    },
  },

  actions: {
    getCargoDebts(clientId) {
      const answer = axiosInstance.get(`${getUrl("allCargoData")}/${clientId}`);
      answer
        .then(({ data: { cargo, debts } }) => {
          this.cargo = cargo;
          this.cargoForSearch = cargo;
          this.debts = debts;
          this.debtsForSearch = debts;
        })
        .catch(() => {
          console.warn("Ошибка при запросе getCargoDebts");
        });
      return answer;
    },
    updateCargoEntry(data) {
      if (isArray(data)) {
        forEach(data, (item) => {
          const index = findIndex(this.cargo, { id: item.id });
          if (
            index !== -1 &&
            this.currentCodeClientId === item.code_client_id
          ) {
            this.cargo.splice(index, 1, item);
          } else if (this.currentCodeClientId !== item.code_client_id) {
            this.cargo.splice(index, 1);
          }
        });
      } else {
        const index = findIndex(this.cargo, { id: data.id });
        if (index !== -1 && this.currentCodeClientId === data.code_client_id) {
          this.cargo.splice(index, 1, data);
        } else if (this.currentCodeClientId !== data.code_client_id) {
          this.cargo.splice(index, 1);
        }
      }
    },
    addCargoEntry(data) {
      if (this.currentCodeClientId === data.code_client_id) {
        this.cargo.push(data);
      }
    },
    deleteCargoEntry(data) {
      forEach(data, (id) => {
        const index = findIndex(this.cargo, { id });
        if (index !== -1) {
          this.cargo.splice(index, 1);
        }
      });
    },
    setCurrentCodeClientId(id) {
      this.currentCodeClientId = id;
    },
    addDebtEntry(data) {
      if (this.currentCodeClientId === data.code_client_id) {
        this.debts.push(data);
      }
    },
    updateDebtEntry(data) {
      if (isArray(data)) {
        forEach(data, (item) => {
          const index = findIndex(this.debts, { id: item.id });
          if (
            index !== -1 &&
            this.currentCodeClientId === item.code_client_id
          ) {
            this.debts.splice(index, 1, item);
          } else if (this.currentCodeClientId !== item.code_client_id) {
            this.debts.splice(index, 1);
          }
        });
      } else {
        const index = findIndex(this.debts, { id: data.id });
        if (index !== -1 && this.currentCodeClientId === data.code_client_id) {
          this.debts.splice(index, 1, data);
        } else if (this.currentCodeClientId !== data.code_client_id) {
          this.debts.splice(index, 1);
        }
      }
    },
    deleteDebtEntry(data) {
      forEach(data, (id) => {
        const index = findIndex(this.debts, { id });
        if (index !== -1) {
          this.debts.splice(index, 1);
        }
      });
    },
    setCargo(data) {
      this.cargo = data;
    },
    setDebts(data) {
      this.debts = data;
    },
    async fetchGeneralData() {
      return await axiosInstance
        .get(getUrl("generalCargoData"))
        .then(({ data }) => {
          this.generalData = data;
        });
    },
    updateOrAddDebtEntry(data) {
      const index = findIndex(this.debts, { id: data.id });
      if (index !== -1) {
        this.debts.splice(index, 1, data);
      } else {
        this.debts.push(data);
      }
    },
    updateOrAddCargoEntry(data) {
      const index = findIndex(this.cargo, { id: data.id });
      if (index !== -1) {
        this.cargo.splice(index, 1, data);
      } else {
        this.cargo.push(data);
      }
    },
  },
});
