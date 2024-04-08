<template>
  <q-input
    v-model="model"
    :dense="$q.screen.xs || $q.screen.sm"
    data-vue-component-name="NotationFieldComponent"
    label="Нотация"
    autofocus
  />
</template>
<script>
import { ref, watch } from "vue";
import { set, clone, toLower } from "lodash";

export default {
  name: "NotationFieldComponent",
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
      set(props, `values.${field}`, toLower(currentValue));
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
