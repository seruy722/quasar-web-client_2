<template>
  <div data-vue-component-name="MethodsSelectComponent">
    <SearchSelect
      v-model="model"
      label="Выберите метод"
      :dense="$q.screen.xs || $q.screen.sm"
      :options="clientsOptions"
    />
  </div>
</template>

<script>
import getFromSettings from "src/tools/settings";
import { defineAsyncComponent, ref, watch } from "vue";
import { set, clone, toNumber } from "lodash";

export default {
  name: "MethodsSelectComponent",
  components: {
    SearchSelect: defineAsyncComponent(
      () => import("src/components/Elements/SearchSelect.vue"),
    ),
  },
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
    const clientsOptions = getFromSettings("transferMethod");
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
      clientsOptions,
    };
  },
};
</script>
