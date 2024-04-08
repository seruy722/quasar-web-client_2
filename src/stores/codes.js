import { defineStore } from "pinia";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";
import { setFormatedDate } from "src/utils/FrequentlyCalledFunctions";
import { compact, uniq, map, find, toNumber, isEmpty, findIndex } from "lodash";

const setCitiesAndPhones = (obj, array) => {
  obj.cities = compact(uniq(map(array, "city_name")));
  obj.phones = compact(uniq(map(array, "phone")));
  return obj;
};

export const useCodesStore = defineStore("codes", {
  state: () => ({
    codes: [],
    codesWithCustomers: [],
  }),

  getters: {
    getCodes(state) {
      return state.codes;
    },
    getCodesWithCustomers(state) {
      return state.codesWithCustomers;
    },
  },

  actions: {
    async setCodes() {
      return await axiosInstance
        .get(getUrl("codeList"))
        .then(({ data: { codeList } }) => {
          const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
          });
          codeList.sort((a, b) => collator.compare(a.label, b.label));
          this.codes = codeList;
        })
        .catch((e) => {
          console.error("Ошибка запроса - setCodes", e);
        });
    },
    addCode(data) {
      if (data.code) {
        this.codes.push(data.code);
      }

      if (data.codeWithCustomers) {
        this.codesWithCustomers.push(data.codeWithCustomers);
      }
    },
    async deleteCustomer(data) {
      return await axiosInstance
        .get(`${getUrl("destroyCustomerEntry")}/${data.id}`)
        .then(() => {
          const findObj = find(this.codesWithCustomers, {
            id: toNumber(data.code_id),
          });
          if (findObj && !isEmpty(findObj.customers)) {
            const index = findIndex(findObj.customers, { id: data.id });
            if (index !== -1) {
              findObj.customers.splice(index, 1);
              setCitiesAndPhones(findObj, findObj.customers);
            }
          }
        })
        .catch((e) => {
          console.error("Ошибка запроса - setCodes", e);
        });
    },
    updateCustomer(data) {
      const findObj = find(this.codesWithCustomers, {
        id: toNumber(data.code_id),
      });

      if (findObj && !isEmpty(findObj.customers)) {
        const index = findIndex(findObj.customers, { id: data.id });
        if (index !== -1) {
          findObj.customers.splice(index, 1, data);
        } else {
          findObj.customers.push(data);
        }
      } else if (findObj) {
        findObj.customers.push(data);
      }
      if (findObj) {
        setCitiesAndPhones(findObj, findObj.customers);
      }
    },
    async setCodesWithCustomers() {
      return await axiosInstance
        .get(getUrl("codes"))
        .then(({ data: { codesData } }) => {
          this.codesWithCustomers = setFormatedDate(codesData, ["created_at"]);
        })
        .catch((e) => {
          console.error("Ошибка запроса - setCodesWithCustomers", e);
        });
    },
    addCustomerToCodeWithCustomers(data) {
      const findObj = find(this.codesWithCustomers, {
        id: toNumber(data.code_id),
      });
      if (findObj) {
        findObj.customers.push(data);
        setCitiesAndPhones(findObj, findObj.customers);
      }
    },
    setCodesAssistant(data) {
      this.codes = data;
    },
    deleteCustomerFromStore(data) {
      const findObj = find(this.codesWithCustomers, {
        id: toNumber(data.code_id),
      });
      if (findObj && !isEmpty(findObj.customers)) {
        const index = findIndex(findObj.customers, { id: data.id });
        if (index !== -1) {
          findObj.customers.splice(index, 1);
          setCitiesAndPhones(findObj, findObj.customers);
        }
      }
    },
  },
});
