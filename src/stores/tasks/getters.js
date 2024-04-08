import { fullDate } from "src/utils/formatDate";
import { assign, map, orderBy, first } from "lodash";
export const getTasks = ({ tasks }) =>
  map(
    orderBy(tasks, (item) => new Date(item.created_at), "desc"),
    (item) => assign({}, item, { created_at: fullDate(item.created_at) }),
  );
export const getTaskComments = (state) =>
  map(
    orderBy(state.taskComments, (item) => new Date(item.created_at), "desc"),
    (item) => assign({}, item, { formatDate: fullDate(item.created_at) }),
  );
export const getTaskId = ({ taskComments }) =>
  get(first(taskComments), "task_id");
