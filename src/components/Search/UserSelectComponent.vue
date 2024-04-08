<template>
  <div data-vue-component-name="UserSelectComponent">
    <SearchSelect
      v-model="model"
      label="Выберите пользователя"
      :dense="$q.screen.xs || $q.screen.sm"
      :func-load-data="fetchClientList"
      :options="clientsOptions"
    />
  </div>
</template>
<script>
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { set, clone, toNumber, isEmpty } from "lodash";
import { useAuthStore } from "stores/auth";

export default {
  name: "UserSelectComponent",
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
    const authStore = useAuthStore();
    const model = ref(null);
    const clientsOptions = computed(() => authStore.getUsersList);
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
          ? authStore.fetchUsersList()
          : new Promise(() => {});
      },
    };
  },
};
</script>
