<template>
  <div data-vue-component-name="ClientsSelectComponent">
    <SearchSelect
      v-model="model"
      label="Выберите код клиента"
      :dense="$q.screen.xs || $q.screen.sm"
      :func-load-data="fetchClientList"
      :options="clientsOptions"
    />
  </div>
</template>
<script>
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { set, toNumber, clone } from "lodash";
import { useCodesStore } from "stores/codes";

export default {
  name: "ClientsSelectComponent",
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
    const codesStore = useCodesStore();
    const model = ref(null);
    const clientsOptions = computed(() => codesStore.getCodes);
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
      fetchClientList() {
        return isEmpty(clientsOptions.value)
          ? codesStore.setCodes()
          : new Promise(() => {});
      },
    };
  },
};
</script>
