<template>
  <q-page
    data-vue-component-name="IndexAuthPage"
    class="row items-center justify-center"
  >
    <q-card style="min-width: 330px; min-height: 320px">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="login" label="Вход" />
        <q-tab name="register" label="Регистрация" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login">
          <Login />
        </q-tab-panel>

        <q-tab-panel name="register">
          <RegisterClient @change-tab="changeTab" />
        </q-tab-panel>

        <q-tab-panel name="recover">
          <PasswordRecovery @change-tab="changeTab" />
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions v-show="tab === 'login'" align="center">
        <BaseBtn
          label="Забыли пароль?"
          color="primary"
          flat
          @click="tab = 'recover'"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { getLSKey } from "src/tools/lsKeys";
import { defineAsyncComponent } from "vue";
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();

export default {
  name: "IndexAuthPage",
  components: {
    Login: defineAsyncComponent(() => import("src/pages/Auth/LoginPage.vue")),
    BaseBtn: defineAsyncComponent(
      () => import("src/components/Buttons/BaseBtn.vue"),
    ),
    RegisterClient: defineAsyncComponent(
      () => import("src/pages/Auth/RegisterClient.vue"),
    ),
    PasswordRecovery: defineAsyncComponent(
      () => import("src/pages/Auth/PasswordRecovery.vue"),
    ),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$q.loading.show();
      const token = vm.$q.localStorage.getItem(getLSKey("authToken"));
      if (!vm.isUserAuth && token) {
        authStore
          .fetchUsersList()
          .then(() => {
            if (vm.toPath) {
              vm.$router.push(vm.toPath);
            } else {
              vm.$router.push({ name: "index" }).catch((e) => {
                /* eslint-disable-next-line */
                console.error("transfersError", e);
              });
            }
            vm.$q.loading.hide();
          })
          .catch(() => {
            vm.$q.loading.hide();
          });
      } else if (vm.isUserAuth) {
        if (vm.toPath) {
          vm.$router.push(vm.toPath);
        } else {
          vm.$router.push({ name: "index" }).catch((e) => {
            /* eslint-disable-next-line */
            console.error("transfersError2", e);
          });
        }
        vm.$q.loading.hide();
      } else {
        vm.$q.loading.hide();
      }
    });
  },
  data() {
    return {
      tab: "login",
    };
  },
  computed: {
    isUserAuth() {
      return authStore.isUserAuth;
    },
    toPath() {
      return authStore.getToPath;
    },
  },
  methods: {
    changeTab(tab) {
      this.tab = tab;
    },
  },
};
</script>
