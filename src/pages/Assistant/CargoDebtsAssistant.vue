<template>
  <q-page data-vue-component-name="CargoDebtsAssistant">
    <PullRefresh @refresh="refresh">
      <div class="row justify-center">
        <SearchSelect
          v-model="currentCodeClientId"
          label="Клиент"
          :dense="$q.screen.xs || $q.screen.sm"
          :options="clientCodes"
          style="max-width: 320px"
        />
        <CargoDebtsSearch />
      </div>
      <div class="q-gutter-y-md">
        <q-card>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="cargo" label="Карго">
              <q-badge color="red">
                {{ cargo.length }}
              </q-badge>
            </q-tab>
            <q-tab name="debts" label="Долги">
              <q-badge color="red">
                {{ debts.length }}
              </q-badge>
            </q-tab>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated swipeable>
            <q-tab-panel name="cargo" style="padding: 0">
              <CargoAssistant :refresh="refresh" />
            </q-tab-panel>

            <q-tab-panel name="debts" style="padding: 0">
              <DebtsAssistant :refresh="refresh" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </PullRefresh>
  </q-page>
</template>

<script>
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import PullRefresh from "src/components/PullRefresh.vue";
import CargoAssistant from "src/components/CargoDebts/Assistant/CargoAssistant.vue";
import DebtsAssistant from "src/components/CargoDebts/Assistant/DebtsAssistant.vue";
import CargoDebtsSearch from "src/components/CargoDebts/CargoDebtsSearch.vue";
import { isEmpty } from "lodash";
import { useCodesStore } from "stores/codes";
const codesStore = useCodesStore();
import { useCargoDebtsStore } from "stores/cargo-debts";
const cargoDebtsStore = useCargoDebtsStore();

export default {
  name: "CargoDebtsAssistant",
  components: {
    SearchSelect,
    PullRefresh,
    CargoAssistant,
    DebtsAssistant,
    CargoDebtsSearch,
  },
  data() {
    return {
      tab: "cargo",
    };
  },
  computed: {
    clientCodes() {
      return codesStore.getCodes;
    },
    cargo() {
      return cargoDebtsStore.getCargo;
    },
    debts() {
      return cargoDebtsStore.getDebts;
    },
    currentCodeClientId: {
      get: function get() {
        return cargoDebtsStore.getCurrentCodeClientId;
      },
      set: function set(val) {
        cargoDebtsStore.setCurrentCodeClientId(val);
      },
    },
  },
  watch: {
    currentCodeClientId(id) {
      if (id) {
        this.getClientData(id);
      }
    },
  },
  async created() {
    const { getUrl } = await import("src/tools/url");
    if (isEmpty(this.clientCodes)) {
      this.$axios
        .get(getUrl("codesAssistant"))
        .then(({ data: { codes } }) => {
          codesStore.setCodesAssistant(codes);
        })
        .catch(() => {});
    }
  },
  methods: {
    getClientData(clientId) {
      cargoDebtsStore.getCargoDebts(clientId);
    },
    async refresh(done) {
      if (!done) {
        this.$q.loading.show();
      }
      const { callFunction } = await import("src/utils/index");
      cargoDebtsStore.fetchGeneralData();
      cargoDebtsStore
        .getCargoDebts(this.currentCodeClientId)
        .then(() => {
          callFunction(done);
          this.$q.loading.hide();
          this.showNotif("success", "Данные успешно обновлены.", "center");
        })
        .catch(() => {
          this.$q.loading.hide();
          callFunction(done);
        });
    },
  },
};
</script>
