<template>
  <q-page>
    <q-bar>
      <div class="text-weight-bold">Cargo 007 - v{{ $q.version }}</div>
      <q-space />
      <q-btn
        v-if="!client"
        dense
        color="deep-orange"
        round
        icon="wifi_off"
        @click="showDialogInput = true"
      />
      <div>{{ userName }}</div>
    </q-bar>
    <div class="row justify-center q-gutter-sm">
      <q-intersection
        v-for="(item, index) in menu"
        :key="index"
        transition="scale"
        style="height: 150px; width: 150px"
      >
        <q-card
          class="q-ma-sm text-center cursor-pointer"
          @click="onClickDrawerMenu(item)"
        >
          <q-icon :name="item.icon" size="70px" />
          <q-card-section>
            <div class="text-subtitle2">
              {{ item.title }}
            </div>
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
    <DialogInput
      :show-dialog="showDialogInput"
      :key-data="dialogDialogInputKey"
    />
  </q-page>
</template>

<script>
import accessFunc from "src/tools/access";
import { defineAsyncComponent } from "vue";
import { get, includes, forEach } from "lodash";
import { useAuthStore } from "stores/auth";
import { useSettingsStore } from "stores/settings";
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

export default {
  name: "PageIndex",
  components: {
    DialogInput: defineAsyncComponent(
      () => import("src/components/Dialogs/DialogInput.vue"),
    ),
  },
  data() {
    return {
      menu: [],
      showDialogInput: false,
      dialogDialogInputKey: null,
    };
  },
  computed: {
    userName() {
      return get(authStore.getUser, "name");
    },
    userAccess() {
      return get(authStore.getUser, "access");
    },
    mainMenu() {
      return settingsStore.getMenu;
    },
    client() {
      return includes(get(this.userAccess, "roles"), "client");
    },
  },
  watch: {
    userAccess(val) {
      this.setMenu(val);
    },
    dialogDialogInputKey(val) {
      if (val) {
        this.closeUsersAccess(val);
      }
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
            if (item.field !== "index") {
              this.menu.push(item);
            }
          }
        });
      }
    },
    async closeUsersAccess(key) {
      const { getUrl } = await import("src/tools/url");
      if (key === "ruin") {
        this.$axios
          .post(getUrl("closeUsersAccess"), { key })
          .then(({ data: { answer } }) => {
            if (answer) {
              this.dialogDialogInputKey = null;
              this.$q.localStorage.clear();
              authStore.removeUserData();
              this.$router.push({ name: "login" });
            }
          });
      } else {
        this.dialogDialogInputKey = null;
      }
    },
  },
};
</script>
