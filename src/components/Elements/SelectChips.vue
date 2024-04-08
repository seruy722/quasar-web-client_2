<template>
  <q-select
    v-model="modelValue"
    use-input
    use-chips
    input-debounce="0"
    :dense="dense"
    :options="filterOptions"
    :label="label"
    :input-style="{ fontWeight: 'bold' }"
    :error-message="viewError()"
    :error="isError"
    :readonly="readonly"
    :disable="disable"
    data-vue-component-name="SelectChips"
    @new-value="createValue"
    @filter="filterFn"
    @input="inputEvent"
  />
</template>

<script>
import ErrorsServerMixin from "src/mixins/ViewErrors";
import { isEmpty, isFunction } from "lodash";

export default {
  name: "SelectChips",
  mixins: [ErrorsServerMixin],
  props: {
    value: {
      type: [String, Number],
      default: 0,
    },
    label: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
    dense: {
      type: Boolean,
      default: false,
    },
    changeValue: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disable: {
      type: Boolean,
      default: false,
    },
    field: {
      type: String,
      default: "",
    },
    funcLoadData: {
      type: Function,
      default: () => {},
    },
    store: {
      type: Object,
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:changeValue", "input", "update:value"],
  data() {
    return {
      filterOptions: [],
    };
  },
  computed: {
    modelValue: {
      get: function get() {
        return this.value;
      },
      set: function set(val) {
        this.$emit("update:value", val);
        this.inputEvent();
      },
    },
  },
  created() {
    this.filterOptions = this.options;
  },
  methods: {
    inputEvent() {
      this.changeErrors();
      if (!this.changeValue) {
        this.$emit("update:changeValue", true);
      }
    },
    createValue(val, done) {
      if (val.length > 0) {
        if (!this.filterOptions.includes(val)) {
          this.filterOptions.push(val);
        }
        done(val, "toggle");
      }
    },

    filterFn(val, update) {
      if (!isEmpty(this.options) && !val) {
        update(() => {
          this.filterOptions = this.options;
        });
      } else if (isEmpty(this.options) && isFunction(this.funcLoadData)) {
        this.funcLoadData(this.store).then(() => {
          update(() => {
            this.filterOptions = this.options;
          });
        });
      } else {
        update(() => {
          const needle = val.toLowerCase();
          this.filterOptions = this.options.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1,
          );
        });
      }
    },
  },
};
</script>
