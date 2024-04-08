<template>
  <q-input
    v-model="model"
    type="number"
    label="Сумма"
    autofocus
    data-vue-component-name="SumComponent"
    :dense="$q.screen.xs || $q.screen.sm"
  />
</template>

<script>
import { ref, watch } from "vue";
import { set, clone, toNumber } from "lodash";

export default {
  name: "SumComponent",
  props: {
    values: {
      type: Object,
      default: () => ({}),
    },
    field: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const model = ref(null);
    const { field } = props;

    watch(model, (currentValue) => {
      set(props, `values.${field}`, toNumber(currentValue));
    });

    if (props.values[field]) {
      model.value = clone(props.values[field]);
    } else {
      set(props, `values.${field}`, model.value);
    }

    return {
      model,
    };
  },
};
</script>
