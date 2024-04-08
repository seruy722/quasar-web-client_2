import { defineStore } from "pinia";

export const useCodesPriceStore = defineStore("codesPrice", {
  state: () => ({
    codesPrices: [],
  }),

  getters: {
    getCodesPrices(state) {
      return Object.entries(state.codesPrices).map(([k, v]) => ({
        data: v,
        code: k,
        id: k,
      }));
    },
  },

  actions: {
    setCodesPrices(data) {
      this.codesPrices = data;
    },
    addNewCodePrice(data) {
      const arr = this.codesPrices[data.code_client_name];
      if (arr) {
        const index = findIndex(arr, {
          code_id: data.code_id,
          category_id: data.category_id,
        });
        if (index === -1) {
          arr.push(data);
        } else {
          arr.splice(index, 1, data);
        }
      } else {
        this.codesPrices[data.code_client_name] = [data];
      }
    },
    deleteCodePrice(data) {
      const arr = this.codesPrices[data.code_client_name];
      const index = findIndex(arr, {
        code_id: data.code_id,
        category_id: data.category_id,
      });
      if (index !== -1) {
        arr.splice(index, 1);
      }
    },
    updateCodePrice(data) {
      const arr = this.codesPrices[data.code_client_name];
      const index = findIndex(arr, { id: data.id });
      if (index !== -1) {
        arr.splice(index, 1, data);
      }
    },
  },
});
