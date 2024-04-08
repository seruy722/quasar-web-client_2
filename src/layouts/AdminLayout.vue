<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <IconBtn
          dense
          icon="menu"
          tooltip="Меню"
          color="white"
          @icon-btn-click="drawer = !drawer"
        />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="200"
      :breakpoint="500"
      :mini="miniState"
      bordered
      content-class="bg-grey-3"
      mini-to-overlay
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item
            v-for="(item, index) in menu"
            :key="index"
            v-ripple
            :active="$route.name === item.field"
            clickable
            active-class="my-menu-link"
            @click="onClickDrawerMenu(item)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              {{ item.title }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import accessFunc from "src/tools/access";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import { get, forEach } from "lodash";
import { useSettingsStore } from "stores/settings";
const settingsStore = useSettingsStore();
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();

export default {
  name: "ModerLayout",
  components: {
    IconBtn,
  },
  data() {
    return {
      drawer: false,
      miniState: true,
      menu: [],
    };
  },
  computed: {
    pageTitle() {
      return this.$route.meta.title;
    },
    userAccess() {
      return get(authStore.getUser, "access");
    },
    mainMenu() {
      return settingsStore.getMenu;
    },
  },
  watch: {
    userAccess(val) {
      this.setMenu(val);
    },
  },
  created() {
    this.setMenu(this.userAccess);
  },
  methods: {
    onClickDrawerMenu({ field }) {
      if (this.$route.name !== field) {
        if (field === "exit") {
          this.$q.localStorage.clear();
          authStore.removeUserData();
          this.$router.push({ name: "login" });
        } else {
          this.$router.push({ name: field });
        }
      }
    },
    setMenu(userAccess) {
      if (userAccess) {
        forEach(this.mainMenu, (item) => {
          if (accessFunc(userAccess, item.access)) {
            this.menu.push(item);
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
.my-menu-link {
  color: white;
  background: #f2c037;
}
</style>
