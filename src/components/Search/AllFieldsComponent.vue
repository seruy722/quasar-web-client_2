<template>
  <q-input
    v-model="model"
    :dense="$q.screen.xs || $q.screen.sm"
    data-vue-component-name="AllFieldsComponent"
    label="По всем полям"
    autofocus
  />
</template>
<script>
import { ref, watch } from "vue";
import { set, clone } from "lodash";

export default {
  name: "AllFieldsComponent",
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
      set(props, `values.${field}`, currentValue);
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
