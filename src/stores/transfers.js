import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import {
  setFormatedDate,
  setMethodLabel,
  setStatusLabel,
} from "src/utils/FrequentlyCalledFunctions";
import { map, forEach, includes, findIndex } from "lodash";

export const useTransfersStore = defineStore("transfers", {
  state: () => ({
    transfers: [],
    transfersClient: [],
    searchData: {
      all: null,
      client_name: null,
      status: null,
      issued_by: null,
      created_at: null,
      method: null,
      sum: null,
      paid: null,
      notation: null,
      receiver_name: null,
      receiver_phone: null,
      user_name: null,
    },
  }),

  getters: {
    getTransfersClient(state) {
      return state.transfersClient;
    },
    getTransfers(state) {
      return cloneDeep(state.transfers);
    },
  },

  actions: {
    async fetchTransfers() {
      return await axiosInstance
        .get(getUrl("transfers"))
        .then(({ data: { transfers } }) => {
          this.transfers = transfers;
        })
        .catch(() => {
          console.warn("Ошибка при запросе fetchTransfers");
        });
    },
    setTransfers(transfers) {
      this.transfers = transfers;
    },
    addTransfer(elem) {
      const index = findIndex(this.transfers, { id: elem.id });
      if (index === -1) {
        this.transfers.unshift(elem);
      }
    },
    updateTransfer(elem) {
      const index = findIndex(this.transfers, { id: elem.id });
      if (index !== -1) {
        this.transfers.splice(index, 1, elem);
      }
    },
    async fetchTransfersClient() {
      return await axiosInstance
        .get(getUrl("transfersClient"))
        .then(({ data: { transfers } }) => {
          this.transfersClient = setMethodLabel(
            setStatusLabel(
              setFormatedDate(transfers, ["created_at", "issued_by"]),
            ),
          );
        })
        .catch(() => {
          console.warn("Ошибка при запросе fetchTransfersClient");
        });
    },
    addTransferClient(elem) {
      this.transfersClient.unshift(elem);
    },
    updateTransferClient(elem) {
      const index = findIndex(this.transfersClient, { id: elem.id });
      this.transfersClient.splice(index, 1, elem);
    },
    addTransfers(data) {
      const ids = map(this.transfers, "id");
      const arr = [];
      forEach(data, (item) => {
        if (includes(ids, item.id)) {
          const index = findIndex(this.transfers, { id: item.id });
          if (index !== -1) {
            this.transfers.splice(index, item);
          }
        } else {
          arr.push(item);
        }
      });
      this.transfers.push(...arr);
    },
    updateTransfers(data) {
      const arr = [];
      forEach(data, (item) => {
        const index = findIndex(this.transfers, { id: item.id });
        if (index !== -1) {
          this.transfers.splice(index, 1, item);
        } else {
          arr.push(item);
        }
      });
      this.transfers.unshift(...arr);
    },
  },
});
