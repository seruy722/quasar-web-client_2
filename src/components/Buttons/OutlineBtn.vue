<template>
  <q-btn
    outline
    :label="label"
    :color="color"
    :size="size"
    :dense="dense"
    data-vue-component-name="OutlineBtn"
    @click="$emit('click-outline-btn')"
  />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "OutlineBtn",
  props: {
    label: {
      type: String,
      default: "OK",
    },
    color: {
      type: String,
      default: "primary",
    },
    size: {
      type: String,
      default: "md",
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click-outline-btn"],
});
</script>
