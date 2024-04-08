/**
 * Миксин для вывода ошибок в поле input
 *
 * Для работы миксина нужно:
 * - подключить его
 * - добавить инпуту свойства :error-message="viewError()" и :error="isError"
 * - добавить событие @input="changeErrors"
 * - в props инпута добавить обьекты
 inputData: {
        type: Object,
        default: () => ({}),
   },
 errors: {
        type: Object,
        default: () => ({}),
 },
 * - передать в компонент инпута в обьекте inputData:
 * field: 'phone',
 * - errors нужно передавать в виде:
 * {
 *   errors: {
 *     phone: ['Неправильный номер']
 *   }
 * }
 *
 */
import { get, join, isEmpty } from "lodash";
export default {
  data() {
    return {
      isError: false,
    };
  },
  watch: {
    errors: {
      handler: "setIsError",
      deep: true,
    },
  },
  methods: {
    setIsError(val) {
      this.isError = !!get(val, `errors.${[this.field]}`);
    },
    viewError() {
      return join(get(this.errors, `errors['${this.field}']`), ",");
    },
    changeErrors() {
      this.isError = false;
      if (!isEmpty(this.errors.errors)) {
        delete this.errors.errors[this.field];
      }
    },
  },
};
