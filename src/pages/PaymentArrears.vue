<template>
  <q-page data-vue-component-name="PaymentArrears">
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
            <Cargo :list="cargo" />
          </q-tab-panel>

          <q-tab-panel name="debts" style="padding: 0">
            <Debts :list="debts" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import Cargo from "components/PaymentArrears/Cargo.vue";
import Debts from "components/PaymentArrears/Debts.vue";
import { map, orderBy, assign, uniq, forEach, filter } from "lodash";

export default {
  name: "PaymentArrears",
  components: {
    Cargo,
    Debts,
  },
  data() {
    return {
      tab: "cargo",
      debts: [],
      cargo: [],
    };
  },
  async created() {
    this.getPaymentArrears();
  },
  methods: {
    async getPaymentArrears() {
      const { getUrl } = await import("src/tools/url");
      this.$q.loading.show();
      return this.$axios
        .get(getUrl("paymentArrears"))
        .then(async ({ data: { debts, cargo } }) => {
          const { fullDate } = await import("src/utils/formatDate");
          const { combineCargoData } = await import(
            "src/utils/FrequentlyCalledFunctions"
          );
          this.debts = map(
            orderBy(debts, (item) => new Date(item.created_at), "asc"),
            (item) =>
              assign({}, item, { created_at: fullDate(item.created_at) }),
          );
          const clientIds = uniq(map(cargo, "code_client_id"));
          const cargoArr = [];
          forEach(clientIds, (id) => {
            cargoArr.push(
              ...combineCargoData(filter(cargo, { code_client_id: id })),
            );
          });
          this.cargo = map(
            orderBy(cargoArr, (item) => new Date(item.created_at), "asc"),
            (item) =>
              assign({}, item, { created_at: fullDate(item.created_at) }),
          );
          this.$q.loading.hide();
        })
        .catch(() => {
          console.error("PaymentArrear");
        });
    },
  },
};
</script>
