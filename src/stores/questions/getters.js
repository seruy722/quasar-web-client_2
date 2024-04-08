import { map, orderBy, assign } from "lodash";
import { fullDate } from "src/utils/formatDate";

export const getQuestions = (state) =>
  map(
    orderBy(state.questions, (item) => new Date(item.created_at), "desc"),
    (doc) => assign({}, doc, { formatDate: fullDate(doc.created_at) }),
  );
