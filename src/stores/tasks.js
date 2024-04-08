import { defineStore } from "pinia";
import { fullDate } from "src/utils/formatDate";
import { assign, map, orderBy, first, get, forEach, findIndex } from "lodash";
import { getUrl } from "src/tools/url";
import { axiosInstance } from "boot/axios";

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
    taskComments: [],
  }),

  getters: {
    getTasks({ tasks }) {
      return map(
        orderBy(tasks, (item) => new Date(item.created_at), "desc"),
        (item) => assign({}, item, { created_at: fullDate(item.created_at) }),
      );
    },
    getTaskComments(state) {
      return map(
        orderBy(
          state.taskComments,
          (item) => new Date(item.created_at),
          "desc",
        ),
        (item) => assign({}, item, { formatDate: fullDate(item.created_at) }),
      );
    },
    getTaskId(state) {
      return get(first(state.taskComments), "task_id");
    },
  },

  actions: {
    async fetchTasks() {
      return await axiosInstance
        .get(getUrl("getTasks"))
        .then(({ data: { tasks } }) => {
          this.tasks = tasks;
        });
    },
    addOrUpdateTask(data) {
      const index = findIndex(this.tasks, { id: data.id });
      if (index === -1) {
        this.tasks.push(data);
      } else {
        this.tasks.splice(index, 1, data);
      }
    },
    deleteTasks(data) {
      forEach(data, (id) => {
        const index = findIndex(this.tasks, { id });
        if (index !== -1) {
          this.tasks.splice(index, 1);
        }
      });
    },
    async fetchTaskComments(id) {
      return await axiosInstance
        .get(`${getUrl("getTaskComments")}/${id}`)
        .then(({ data: { comments } }) => {
          this.taskComments = comments;
        });
    },
    addTaskComment(comment) {
      this.taskComments.push(comment);
    },
    updateTaskComment(comment) {
      const index = findIndex(this.taskComments, { id: comment.id });
      if (index !== -1) {
        this.taskComments.splice(index, 1, comment);
      } else {
        this.taskComments.push(comment);
      }
    },
    deleteTaskComments(ids) {
      forEach(ids, (id) => {
        const index = findIndex(this.taskComments, { id });
        if (index !== -1) {
          this.taskComments.splice(index, 1);
        }
      });
    },
  },
});
