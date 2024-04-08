import getFromSettings from "src/tools/settings";
import {
  get,
  isEmpty,
  map,
  isArray,
  find,
  round as rounFunc,
  sumBy,
  toNumber,
  chain,
  isString,
  isFunction,
  reduce,
} from "lodash";
export const countSumCollection = (arr, key) => sumBy(arr, key);
export const round = (num, precision = 1) => rounFunc(num, precision);
export const numberFormat = (number) =>
  new Intl.NumberFormat("ru-RU").format(toNumber(number));
export const isBrendCategory = (str) => {
  if (str) {
    const lowerString = str.toLowerCase();
    return lowerString.includes("бренд");
  }

  return false;
};
export const statusColor2 = (value) => {
  const findLabel =
    find(getFromSettings("transferStatus"), { value }) ||
    find(getFromSettings("transferStatus"), { label: value });
  return get(findLabel, "color");
};
export const numberUnformat = (number) =>
  chain(number).toString().split(" ").join("").toNumber();

export const jsonDecodeThings = (val) => {
  try {
    return reduce(
      JSON.parse(val),
      (result, { label, value }) => {
        result[label] = value;
        return result;
      },
      {},
    );
  } catch (e) {
    console.error(
      `Неправильный формат JSON строки (функции jsonDecodeThings) - ${val}`,
    );
  }
  return val;
};

export const callFunction = (func, args) => {
  if (isFunction(func)) {
    func(args);
  }
};

export const createSpecialLink = (href, special) => {
  const link = document.createElement("a");
  link.href = `${special}:${href}`;
  return link;
};

export const thingsFilter = (val) => {
  if (val) {
    try {
      return reduce(
        JSON.parse(val),
        (str, { title, count }) => {
          str += `${title}: ${count}; `;
          return str;
        },
        "",
      );
    } catch (e) {
      return val;
    }
  }
  return val;
};

export const phoneNumberFilter = (val) => {
  const maskPhone = (value) =>
    `+${value.slice(0, 2)} (${value.slice(2, 5)}) ${value.slice(
      5,
      8,
    )}-${value.slice(8, 10)}-${value.slice(10, 12)}`;
  if (isString(val)) {
    return maskPhone(val);
  }
  if (isArray(val)) {
    if (!isEmpty(val)) {
      return map(val, (phone) => maskPhone(phone));
    }
    return "";
  }
  return val;
};

export const statusFilter = (value) => {
  const options = getFromSettings("transportStatusOptions");
  return get(find(options, { value }), "label");
};

export const optionsFilter = (id, categories) => {
  const findObj = find(categories, { value: id });
  if (findObj) {
    return findObj.label;
  }
  return id;
};

export const statusColor = (value) => {
  const findLabel =
    find(getFromSettings("transferStatus"), { value }) ||
    find(getFromSettings("transferStatus"), { label: value });
  return get(findLabel, "color");
};
