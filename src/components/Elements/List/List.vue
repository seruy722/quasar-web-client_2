<template>
  <q-list
    :dense="dense"
    :bordered="bordered"
    :padding="padding"
    :separator="separator"
    data-vue-component-name="ListComponent"
    @click.stop="$emit('click-list')"
  >
    <slot />
  </q-list>
</template>

<script>
export default {
  name: "ListComponent",
  props: {
    dense: {
      type: Boolean,
      default: false,
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: Boolean,
      default: false,
    },
    separator: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click-list"],
};
</script>
