<template>
  <div data-vue-component-name="StatusSelectComponent">
    <SearchSelect
      v-model="model"
      label="Выберите статус"
      :dense="$q.screen.xs || $q.screen.sm"
      :func-load-data="fetchClientList"
      :options="clientsOptions"
    />
  </div>
</template>
<script>
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { set, clone, toNumber, isEmpty } from "lodash";
import { useStatusesStore } from "stores/statuses";

export default {
  name: "StatusSelectComponent",
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
    const model = ref(null);
    const statusesStore = useStatusesStore();
    const clientsOptions = computed(() => statusesStore.getStatuses);
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
          ? statusesStore.fetchStatuses()
          : new Promise(() => {});
      },
    };
  },
};
</script>
