import { countSumCollection } from "src/utils/index";
import { fullDate } from "src/utils/formatDate";
import getFromSettings from "src/tools/settings";
import { uid } from "quasar";
import {
  get,
  isEmpty,
  map,
  isArray,
  find,
  sumBy,
  toNumber,
  chain,
  forEach,
  set,
  filter,
  has,
  uniq,
  values,
  assign,
  first,
  every,
  isObject,
  uniqBy,
  reduce,
} from "lodash";
// ДОП ФУНКЦИИ
/**
 * Возвращает итоговый обьект для категорий
 * @param arr
 * @param isForKg
 * @return {{name: string, place: *, kg: *}}
 */
const sumObjectForCategories = (arr, isForKg) => {
  const result = {
    name: "",
    for_kg: 0,
    kg: countSumCollection(arr, "kg"),
    place: countSumCollection(arr, "place"),
    sum: countSumCollection(arr, "sum"),
  };
  if (!isForKg) {
    delete result.for_kg;
    delete result.sum;
  }

  return result;
};

// TRANSFERS
/**
 * Устанавливает название метода по его id
 * @param value
 * @return {*}
 */
export const setMethodLabel = (value) => {
  if (isArray(value)) {
    forEach(value, (item) => {
      const findLabel = find(getFromSettings("transferMethod"), {
        value: toNumber(item.method),
      });
      if (findLabel) {
        set(item, "method_label", get(findLabel, "label"));
      }
    });
  } else {
    const findLabel = find(getFromSettings("transferMethod"), {
      value: toNumber(value),
    });
    if (findLabel) {
      return get(findLabel, "label");
    }
  }
  return value;
};
/**
 * Устанавливает название статуса по его id
 * @param value
 * @return {*}
 */
export const setStatusLabel = (value) => {
  if (isArray(value)) {
    forEach(value, (item) => {
      const findLabel = find(getFromSettings("transferStatus"), {
        value: toNumber(item.status),
      });
      if (findLabel) {
        set(item, "status_label", get(findLabel, "label"));
      }
    });
  } else {
    const findLabel = find(getFromSettings("transferStatus"), {
      value: toNumber(value),
    });
    if (findLabel) {
      return get(findLabel, "label");
    }
  }
  return value;
};
/**
 * Обнуляет свойство changeValue
 * @param data
 */
export const setChangeValue = (data) => {
  forEach(data, (elem) => {
    if (get(elem, "changeValue")) {
      set(elem, "changeValue", false);
    }
  });
};
// STOREHOUSEDATA
export const setCategoriesStoreHouseData = (data, transporterPrices) => {
  const uniq = uniqBy(
    map(
      data,
      ({
        category_name: categoryName,
        category_id: categoryID,
        fax_id: faxId,
      }) => ({
        name: categoryName,
        id: categoryID,
        faxId,
      }),
    ),
    "name",
  );

  const arr = [];

  forEach(uniq, ({ name, id, faxId }) => {
    const kg = countSumCollection(
      filter(data, { category_id: id }),
      ({ kg: kilo }) => kilo,
    );
    const obj = {
      name,
      place: countSumCollection(
        filter(data, { category_id: id }),
        ({ place }) => place,
      ),
      kg,
      category_id: id,
      fax_id: faxId,
      uid: uid(),
    };
    if (!isEmpty(transporterPrices)) {
      let forKg = 0;
      const findForKg = find(transporterPrices, { category_id: id });
      if (findForKg) {
        forKg = findForKg.category_price;
      }
      obj.for_kg = forKg;
      obj.sum = kg * forKg;
    } else if (isArray(transporterPrices)) {
      obj.for_kg = 0;
      obj.sum = kg * obj.for_kg;
    }
    arr.push(obj);
  });

  arr.sort((a, b) => b.place - a.place);

  return {
    categoriesList: arr,
    footer: sumObjectForCategories(arr, has(first(arr), "for_kg")),
  };
};

export const setCargoCategoriesData = (data) => {
  const categoriesNames = uniq(map(data, "category_name"));
  const arr = [];

  forEach(categoriesNames, (name) => {
    const categoryArr = filter(data, {
      category_name: name,
      type: 0,
    });
    const obj = {
      name,
      place: countSumCollection(
        filter(categoryArr, { type: 0 }),
        ({ place }) => place,
      ),
      kg: countSumCollection(filter(categoryArr, { type: 0 }), ({ kg }) => kg),
      sum: countSumCollection(
        filter(categoryArr, { type: 0 }),
        ({ sum }) => sum,
      ),
    };
    if (name) {
      arr.push(obj);
    }
  });

  arr.sort((a, b) => b.place - a.place);
  const dt = filter(data, { type: 0 });
  return {
    categoriesList: arr,
    footer: {
      name: null,
      place: countSumCollection(dt, ({ place }) => place),
      kg: countSumCollection(dt, ({ kg }) => kg),
      sum: countSumCollection(data, ({ sum }) => sum) || null,
    },
  };
};

export const setStorehouseCategoriesData = (data) => {
  const categoriesNames = uniq(map(data, "category_name"));
  const arr = [];

  forEach(categoriesNames, (name) => {
    const categoryArr = filter(data, { category_name: name });
    const obj = {
      name,
      place: countSumCollection(
        filter(categoryArr, { type: 0 }),
        ({ place }) => place,
      ),
      kg: countSumCollection(filter(categoryArr, { type: 0 }), ({ kg }) => kg),
    };
    if (name) {
      arr.push(obj);
    }
  });

  arr.sort((a, b) => b.place - a.place);
  const dt = filter(data, { type: 0 });
  return {
    categoriesList: arr,
    footer: {
      name: null,
      place: countSumCollection(dt, ({ place }) => place),
      kg: countSumCollection(dt, ({ kg }) => kg),
    },
  };
};
// export const setDataForSearch = (data) => {
//   const faxesNames = uniq(map(data, 'fax_name'));
//   const arr = [];
//
//   forEach(faxesNames, (name) => {
//     const faxArr = filter(data, { fax_name: name });
//     const categoriesNames = uniq(map(faxArr, 'category_name'));
//     forEach(categoriesNames, (categoryName) => {
//       const faxData = filter(faxArr, { category_name: categoryName });
//
//     });
//     const obj = {
//       name,
//       place: countSumCollection(filter(categoryArr, { type: 0 }), ({ place }) => place),
//       kg: countSumCollection(filter(categoryArr, { type: 0 }), ({ kg }) => kg),
//       sum: countSumCollection(filter(categoryArr, { type: 0 }), ({ sum }) => sum),
//     };
//     if (name) {
//       arr.push(obj);
//     }
//   });
//
//   arr.sort((a, b) => b.place - a.place);
//   const dt = filter(data, { type: 0 });
//   return {
//     categoriesList: arr,
//     footer: {
//       name: null,
//       place: countSumCollection(dt, ({ place }) => place),
//       kg: countSumCollection(dt, ({ kg }) => kg),
//       sum: countSumCollection(data, ({ sum }) => sum),
//     },
//   };
// };

/**
 * Комбинирует одинаковые данные по code_client_id и category_name
 * @type {function(*=): []}
 */
export const combineStoreHouseData = (data) => {
  const clients = uniq(map(data, "code_client_id"));
  const clientsCategories2 = [];
  forEach(clients, (item) => {
    clientsCategories2.push(
      chain(data)
        .filter({ code_client_id: item })
        .groupBy("category_name")
        .mapValues((values) =>
          chain(values)
            .groupBy("for_kg")
            .mapValues((val) => chain(val).groupBy("for_place").value())
            .value(),
        )
        .value(),
    );
  });
  const result = [];
  forEach(clientsCategories2, (elem) => {
    forEach(elem, (el) => {
      forEach(values(el), (arr) => {
        forEach(arr, (arr2) => {
          result.push(
            assign({}, first(arr2), {
              kg: sumBy(arr2, "kg"),
              place: sumBy(arr2, "place"),
              arr: arr2,
              in_cargo: every(arr2, { in_cargo: 1 }),
            }),
          );
        });
      });
    });
  });
  return result;
};

/**
 * Комбинирует одинаковые данные по code_client_id и category_id и fax_id
 * @type {function(*=): []}
 */
export const combineCargoData = (data) => {
  // const formated = map(data, (item) => assign({}, item, { created_at: fullDate(item.created_at) }));
  const faxIds = uniq(map(data, "fax_id"));
  const newData = filter(data, (item) => item.type === 0 && item.fax_id > 0);
  const newData3 = filter(data, { type: 1 });
  const newData4 = filter(data, {
    type: 0,
    fax_id: 0,
  });
  const clientsCategories2 = [];
  forEach(faxIds, (id) => {
    clientsCategories2.push(
      chain(newData)
        .filter({ fax_id: id })
        .groupBy("category_id")
        .mapValues((values) =>
          chain(values)
            .groupBy("for_kg")
            .mapValues((val) => chain(val).groupBy("for_place").value())
            .value(),
        )
        .value(),
    );
  });

  const result = [];
  forEach(clientsCategories2, (elem) => {
    forEach(elem, (el) => {
      forEach(values(el), (arr) => {
        forEach(arr, (arr2) => {
          result.push(
            assign(
              {},
              first(arr2),
              {
                kg: sumBy(arr2, "kg"),
                place: sumBy(arr2, "place"),
                sum: sumBy(arr2, "sum"),
                arr: arr2,
                in_cargo: every(arr2, { in_cargo: 1 }),
              },
              { id: uid() },
            ),
          );
        });
      });
    });
  });
  result.push(...newData3, ...newData4);
  // result.sort((a, b) => {
  //   const x = new Date(a.created_at);
  //   const y = new Date(b.created_at);
  //   if (x > y) {
  //     return -1;
  //   }
  //   if (x === y) {
  //     return 0;
  //   }
  //
  //   return 1;
  // });
  return result;
};
/**
 * Получение и запись всех категорий во vuex
 * @param store
 * @return {boolean|*}
 */
export const getCategories = (store) => {
  if (isEmpty(store.getCategories)) {
    return store.fetchCategories();
  }
  return true;
};
/**
 * Получение и запись всех кодов клиентов во vuex
 * @param store
 * @return {boolean|*}
 */
export const getClientCodes = (store) => {
  if (isEmpty(store.getCodes)) {
    return store.setCodes();
  }
  return true;
};
/**
 * Получение и запись описи вложения во vuex
 * @param store
 * @return {boolean|*}
 */
export const getThingsList = (store) => {
  if (isEmpty(store.getThingsList)) {
    return store.setThingsList();
  }
  return true;
};
/**
 * Получение и запись списка названий магазинов во vuex
 * @param store
 * @return {boolean|*}
 */
export const getShopsList = (store) => {
  if (isEmpty(store.getShopsList)) {
    return store.setShopsList();
  }
  return true;
};

/**
 * Получение списка способов доставки
 * @param store
 * @return {boolean|*}
 */
export const getDeliveryMethodsList = (store) => {
  if (isEmpty(store.getDeliveryMethodsList)) {
    return store.fetchDeliveryMethodsList();
  }
  return true;
};
/**
 * Получение и запись списка городов украины во vuex
 * @param store
 * @return {boolean|*}
 */
export const getCities = (store) => {
  if (isEmpty(store.getCities)) {
    return store.setCities();
  }
  return true;
};
/**
 * Получение и запись списка видов транспорта во vuex
 * @param store
 * @return {boolean|*}
 */
export const getTransports = (store) => {
  if (isEmpty(store.getTransports)) {
    return store.fetchTransports();
  }
  return true;
};
/**
 * Получение и запись списка перевожчиков во vuex
 * @param store
 * @return {boolean|*}
 */
export const getTransporters = (store) => {
  if (isEmpty(store.getTransporters)) {
    return store.fetchTransporters();
  }
  return true;
};
/**
 * Получение и запись списка перевожчиков во vuex
 * @param store
 * @return {boolean|*}
 */
export const getStorehouseTableData = (store) => {
  if (isEmpty(store.getStorehouseData)) {
    return store.fetchStorehouseTableData();
  }
  return true;
};
/**
 * Получение и запись списка факсов во vuex
 * @param store
 * @return {boolean|*}
 */
export const getFaxes = (store) => {
  if (isEmpty(store.getFaxes)) {
    return store.fetchFaxes();
  }
  return true;
};
/**
 * Устанавливает значения по умолчанию
 * @param data
 */
export const setDefaultData = (data) => {
  if (isObject(data) || isArray(data)) {
    forEach(data, (item) => {
      set(item, "value", item.default);
    });
  }
};
/**
 * Форматирует даты из 2020-01-31 16:25:13 в 30-01-2020 16:25:13
 * @param data
 * @param fields
 * @return {*}
 */
export const setFormatedDate = (data, fields = []) => {
  if (isArray(data)) {
    forEach(data, (item) => {
      forEach(fields, (field) => {
        if (item[field]) {
          item[field] = fullDate(item[field]);
        }
      });
    });
  } else if (isObject(data)) {
    forEach(fields, (field) => {
      if (data[field]) {
        data[field] = fullDate(data[field]);
      }
    });
  }

  return data;
};
/**
 * Подготавливает данные для компонентов истории
 * @param cols
 * @param data
 * @return {{cols: *, historyData: *}}
 */
export const prepareHistoryData = (cols, data) => ({
  cols: reduce(
    cols,
    (result, { label, name }) => {
      result[name] = label;
      return result;
    },
    {},
  ),
  historyData: reduce(
    data,
    (result, item) => {
      result.push(assign(item, JSON.parse(item.history_data)));
      return result;
    },
    [],
  ),
});
