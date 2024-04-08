// Миксин обработки нажатия клавиши enter на инпуте
import { isFunction } from "lodash";
export default {
  methods: {
    keyUp({ code }) {
      if (code === "Enter" || code === "NumpadEnter") {
        if (isFunction(this.onKeyUpFunc)) {
          this.onKeyUpFunc();
        }
      }
    },
  },
};
