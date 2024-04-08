<template>
  <q-badge
    :color="color"
    :floating="floating"
    transparent
    data-vue-component-name="BadgeComponent"
  >
    <slot />
  </q-badge>
</template>

<script>
export default {
  name: "BadgeComponent",
  props: {
    color: {
      type: String,
      default: "primary",
    },
    floating: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
