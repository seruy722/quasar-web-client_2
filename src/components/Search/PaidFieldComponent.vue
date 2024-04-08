<template>
  <q-select
    v-model="model"
    :options="options"
    data-vue-component-name="PaidFieldComponent"
    :dense="$q.screen.xs || $q.screen.sm"
    label="Оплачен"
    emit-value
    map-options
  />
</template>

<script>
import { ref, watch } from "vue";
import { set, clone, toNumber } from "lodash";

export default {
  name: "PaidFieldComponent",
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
    watch(model, (currentValue) => {
      set(props, `values.${props.field}`, toNumber(currentValue));
    });

    if (props.values[props.field]) {
      model.value = clone(props.values[props.field]);
    } else {
      set(props, `values.${props.field}`, model.value);
    }

    return {
      model,
      options: [
        {
          label: "Да",
          value: 1,
        },
        {
          label: "Нет",
          value: 0,
        },
      ],
    };
  },
};
</script>
