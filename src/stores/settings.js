import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    dateForSaveData: null,
    locale: "",
    menu: [
      {
        title: "Главная",
        field: "index",
        icon: "dashboard",
        access: {
          roles: ["admin", "moderator", "assistant", "client"],
          permissions: [],
        },
      },
      {
        title: "Карго Долги",
        field: "cargo-debts",
        icon: "assignment",
        access: {
          roles: ["admin"],
          permissions: ["general-cargo-data"],
        },
      },
      {
        title: "Карго",
        field: "client-cargo-debts",
        icon: "assignment",
        access: {
          roles: ["client"],
          permissions: [],
        },
      },
      // {
      //     title: 'Переводы_K',
      //     field: 'client-transfers',
      //     icon: 'import_export',
      //     access: {
      //         roles: ['client', 'admin'],
      //         permissions: [],
      //     },
      // },
      {
        title: "Задолженность",
        field: "payment-arrears",
        icon: "local_atm",
        access: {
          // roles: ['admin'],
          // permissions: ['get payment arrears'],
          roles: [],
          permissions: [],
        },
      },
      {
        title: "Вопросы",
        field: "questions",
        icon: "help",
        access: {
          roles: [],
          permissions: [],
          // roles: ['admin', 'questions'],
          // permissions: [],
        },
      },
      {
        title: "Карго Долги",
        field: "cargo-debts-assistant",
        icon: "assignment",
        access: {
          roles: ["assistant"],
          permissions: [],
        },
      },
      {
        title: "Склад",
        field: "storehouse",
        icon: "store",
        access: {
          roles: ["admin", "storehouse"],
          permissions: ["view storehouse data"],
        },
      },
      {
        title: "Кода",
        field: "codes",
        icon: "people",
        access: {
          roles: ["admin", "codes"],
          permissions: ["view codes list"],
        },
      },
      {
        title: "Цены по кодам",
        field: "codes-prices",
        icon: "money",
        access: {
          roles: ["admin", "codes-prices"],
          permissions: ["get-codes-prices"],
        },
      },
      {
        title: "Факсы",
        field: "faxes",
        icon: "library_books",
        access: {
          roles: ["admin", "fax"],
          permissions: ["view faxes list"],
        },
      },
      {
        title: "Факсы админа",
        field: "admin-faxes",
        icon: "library_add_check",
        access: {
          roles: ["admin"],
          permissions: [],
        },
      },
      {
        title: "Переводы",
        field: "transfers",
        icon: "import_export",
        access: {
          roles: ["admin", "transfers"],
          permissions: ["view transfers list"],
        },
      },
      {
        title: "Задачи",
        field: "tasks",
        icon: "business",
        access: {
          roles: ["admin"],
          permissions: ["view tasks page"],
        },
      },
      {
        title: "Черновик",
        field: "drafts",
        icon: "drafts",
        access: {
          roles: ["admin"],
          permissions: [],
        },
      },
      {
        title: "Документы",
        field: "documents",
        icon: "assignment",
        access: {
          roles: ["admin", "documents", "comments"],
          permissions: ["view documents page"],
        },
      },
      {
        title: "Поиск",
        field: "search",
        icon: "search",
        access: {
          roles: ["admin"],
          permissions: ["view search page"],
        },
      },
      {
        title: "Доступы",
        field: "access",
        icon: "settings",
        access: {
          roles: ["admin"],
          permissions: ["view access list"],
        },
      },
      {
        title: "Статистика",
        field: "statistics",
        icon: "trending_up",
        access: {
          roles: ["admin"],
          permissions: ["view statistics"],
        },
      },
      // {
      //   title: "Инфо",
      //   field: "info",
      //   icon: "info",
      //   access: {
      //     roles: ["admin"],
      //     permissions: ["view info"],
      //   },
      // },
      {
        title: "Выход",
        field: "exit",
        icon: "logout",
        access: {
          roles: [],
          permissions: ["exit app"],
        },
      },
    ],
    search: null,
    searchData: {},
  }),

  getters: {
    getMenu(state) {
      return state.menu;
    },
    getSearch(state) {
      return state.search;
    },
    getDateForSaveData(state) {
      return state.dateForSaveData;
    },
  },

  actions: {
    setSearch(data) {
      this.search = data;
    },
    setDateForSaveData(data) {
      this.dateForSaveData = data;
    },
  },
});
