import validator from "validator";
import { forEach, isEmpty, isFunction } from "lodash";

export default {
  data: () => ({
    errorsData: {
      errors: {},
    },
  }),
  methods: {
    checkErrors(data, callback) {
      const errors = {};
      forEach(data, (item, key) => {
        if (this.checkRequire(item)) {
          errors[key] = [item.requireError];
        } else if (item.rules) {
          forEach(item.rules, ({ name, error, options }) => {
            if (!validator[name](item.value, options)) {
              errors[key] = [error];
            }
          });
        }
      });

      if (!isEmpty(errors)) {
        this.setErrors(errors);
      } else if (isFunction(callback)) {
        callback(data);
      }
    },
    setErrors(errors) {
      this.errorsData.errors = errors;
    },
    checkRequire({ require, value }) {
      return require && !value;
    },
  },
};
