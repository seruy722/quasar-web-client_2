import { fullDate } from "src/utils/formatDate";
import { combineCargoData } from "src/utils/FrequentlyCalledFunctions";
import { map, orderBy, assign } from "lodash";

// export const getCargo = (state) => map(combineCargoData(state.cargo), (item) => assign({}, item, { created_at: fullDate(item.created_at) }));
export const getCargo = (state) =>
  map(
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
export const getCurrentCodeClientId = (state) => state.currentCodeClientId;
export const getDebts = (state) =>
  map(
    orderBy(state.debts, (item) => new Date(item.created_at), "desc"),
    (item) =>
      assign({}, item, {
        created_at: fullDate(item.created_at),
        chang: item.created_at,
      }),
  );
export const getCargoForSearch = (state) => state.cargoForSearch;
export const getDebtsForSearch = (state) => state.debtsForSearch;
export const getGeneralData = (state) => state.generalData;
