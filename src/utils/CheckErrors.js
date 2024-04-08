import validator from "validator";
import { reactive } from "vue";
import { isEmpty, forEach, isFunction } from "lodash";
export default function CheckErrorsFunc() {
  const errorsData = reactive({
    errors: {},
  });

  function setErrors(errors) {
    errorsData.errors = errors;
  }

  function checkRequire({ require, value }) {
    return require && !value;
  }

  function checkErrors(data, callback) {
    const errors = {};
    forEach(data, (item, key) => {
      if (checkRequire(item)) {
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
      setErrors(errors);
    } else if (isFunction(callback)) {
      callback(data);
    }
  }

  return {
    errorsData,
    checkErrors,
  };
}
