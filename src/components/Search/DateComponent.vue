<template>
  <div class="row q-pa-sm" data-vue-component-name="DateComponent">
    <q-btn icon="event" round color="primary">
      <q-popup-proxy
        ref="qDateProxy"
        cover
        transition-show="scale"
        transition-hide="scale"
      >
        <q-date
          v-model="dateToday"
          @update:model-value="$refs.qDateProxy.hide()"
        />
      </q-popup-proxy>
    </q-btn>

    <div class="row align-items-center q-ml-md">
      <q-badge color="teal">
        {{ viewDate }}
      </q-badge>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { date } from "quasar";
import { set, clone } from "lodash";

const timeStamp = Date.now();

export default {
  name: "DateComponent",
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
    const dateToday = ref(date.formatDate(timeStamp, "YYYY/MM/DD"));
    const viewDate = computed(() =>
      date.formatDate(+new Date(dateToday.value), "DD-MM-YYYY"),
    );

    watch(dateToday, (currentValue) => {
      set(props, `values.${props.field}`, currentValue);
    });

    if (props.values[props.field]) {
      dateToday.value = clone(props.values[props.field]);
    } else {
      set(props, `values.${props.field}`, dateToday.value);
    }

    return {
      dateToday,
      viewDate,
    };
  },
};
</script>
