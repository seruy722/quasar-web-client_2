<template>
  <q-separator data-vue-component-name="Separator" :color="color" />
</template>

<script>
export default {
  name: "SeparatorComponent",
  props: {
    color: {
      type: String,
      default: "grey",
    },
  },
};
</script>
