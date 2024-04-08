import { fullDate } from "src/utils/formatDate";
import { map, orderBy, assign } from "lodash";

export const getDocuments = ({ documents }) =>
  map(
    orderBy(documents, (item) => new Date(item.created_at), "desc"),
    (doc) => assign({}, doc, { formatDate: fullDate(doc.created_at) }),
  );
