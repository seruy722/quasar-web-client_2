<template>
  <q-btn
    flat
    round
    color="info"
    icon="more_vert"
    data-vue-component-name="MenuBtn"
    @click="$emit('menu-btn-click')"
  >
    <slot />
    <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
      Меню
    </q-tooltip>
  </q-btn>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MenuBtn",
  emits: ["menu-btn-click"],
});
</script>
