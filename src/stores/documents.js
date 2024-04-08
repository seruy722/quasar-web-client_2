import { defineStore } from "pinia";
import { fullDate } from "src/utils/formatDate";
import { map, orderBy, assign } from "lodash";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useDocumentsStore = defineStore("documents", {
  state: () => ({
    documents: [],
  }),

  getters: {
    getDocuments(state) {
      return map(
        orderBy(state.documents, (item) => new Date(item.created_at), "desc"),
        (doc) => assign({}, doc, { formatDate: fullDate(doc.created_at) }),
      );
    },
  },

  actions: {
    fetchDocuments() {
      const res = axiosInstance.get(getUrl("getDocumentsComments"));
      res.then(({ data: { documents } }) => {
        this.documents = documents;
      });
      return res;
    },
    addDocument(data) {
      this.documents.push(data);
    },
  },
});
