<template>
  <div data-vue-component-name="DebtsComponent">
    <TableComponent
      :table-properties="debtsTableProperties"
      :table-data="debts"
      :table-reactive-properties="debtsTableReactiveProperties"
      :title="titleTable"
      :loading="loading"
    >
      <template #top-buttons>
        <div class="row q-gutter-sm">
          <MenuDebt v-show="currentCodeClientId" />
          <UpdateBtn v-show="currentCodeClientId" :func="refresh" />
          <!-- <RoundBtn
              v-show="debts.length"
              color="positive"
              tooltip="Excel"
              icon="explicit"
              :loading="loadingBtn"
              @round-btn-click="exportFaxData(debtsTableReactiveProperties.selected)"
          /> -->
          <q-btn-dropdown split color="positive" icon="explicit" dense>
            <q-list separator>
              <q-item
                v-close-popup
                clickable
                @click="exportFaxData(debtsTableReactiveProperties.selected)"
              >
                <q-item-section>
                  <q-item-label>Выгрузить</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="exportZeroDebtData">
                <q-item-section>
                  <q-item-label>Выгрузить c нуля</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <RoundBtn
            v-show="debtsTableReactiveProperties.selected.length"
            color="negative"
            icon="delete"
            :tooltip="$t('delete')"
            @round-btn-click="
              destroyDebtEntry(debtsTableReactiveProperties.selected)
            "
          />

          <RoundBtn
            v-show="debtsTableReactiveProperties.selected.length === 1"
            icon="attach_money"
            tooltip="Оплатить"
            @round-btn-click="pay(debtsTableReactiveProperties.selected[0])"
          />
          <RoundBtn
            v-show="currentCodeClientId"
            icon="payments"
            color="orange"
            tooltip="Оплатить все"
            @round-btn-click="paymentsAll(currentCodeClientId)"
          />
        </div>
      </template>
      <!--ОТОБРАЖЕНИЕ КОНТЕНТА НА МАЛЕНЬКИХ ЭКРАНАХ-->
      <template #inner-item="{ props }">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-expansion-item
            expand-separator
            class="shadow-1 overflow-hidden"
            :header-class="`${
              props.row.type ? 'bg-green' : 'bg-red'
            } text-white`"
            :style="`border-radius: 30px;border: 1px solid ${
              props.row.type ? 'lightgreen' : 'lightcoral'
            };`"
            expand-icon-class="text-white"
          >
            <template #header>
              <q-item-section avatar>
                <q-checkbox v-model="props.selected" dense />
              </q-item-section>

              <q-item-section>
                <q-item-label :lines="2">
                  {{ `${props.row.sum} / ${props.row.commission}` }}
                </q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ props.row.code_client_name }}
                </q-item-label>
              </q-item-section>

              <q-item-section avatar side>
                <q-icon
                  v-if="props.row.paid"
                  name="money"
                  size="md"
                  color="white"
                />
              </q-item-section>
            </template>

            <q-list separator dense>
              <q-item
                v-for="col in props.cols.filter((col) => col.name !== 'desc')"
                :key="col.name"
              >
                <q-item-section>
                  <q-item-label>{{ `${col.label}:` }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label v-if="col.field === 'sum'">
                    {{ numberFormat(col.value) }}
                  </q-item-label>
                  <q-item-label v-else-if="col.field === 'commission'">
                    {{ numberFormat(col.value) }}
                  </q-item-label>
                  <q-item-label v-else-if="col.field === 'paid'">
                    <q-badge :color="props.row.paid ? 'positive' : 'negative'">
                      {{
                        props.row.paid ? "Да" : props.row.type ? null : "Нет"
                      }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label v-else>
                    {{ col.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </div>
      </template>

      <template #inner-body="{ props }">
        <q-tr
          :props="props"
          class="cursor-pointer"
          :class="{
            table__tr_bold_text: props.row.brand,
            table__tr_red_bg: !props.row.type,
            table__tr_green_bg: props.row.type,
          }"
          @click.stop="viewDebtEditDialog(props, $event)"
        >
          <q-td auto-width class="select_checkbox">
            <q-checkbox v-model="props.selected" dense />
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="code_client_name" :props="props">
            {{ props.row.code_client_name }}
          </q-td>

          <q-td key="type" :props="props">
            {{ props.row.type ? "Оплата" : "Долг" }}
          </q-td>

          <q-td key="sum" :props="props">
            {{ numberFormat(props.row.sum) }}
          </q-td>
          <q-td key="commission" :props="props">
            {{ Math.round(props.row.commission) }}
          </q-td>
          <q-td key="paid" :props="props">
            <q-badge :color="props.row.paid ? 'positive' : 'negative'">
              {{ props.row.paid ? "Да" : props.row.type ? null : "Нет" }}
            </q-badge>
          </q-td>

          <q-td key="get_pay_user_name" :props="props">
            {{ props.row.get_pay_user_name || props.row.user_name }}
          </q-td>

          <q-td key="notation" :props="props">
            {{ props.row.notation }}
          </q-td>
        </q-tr>
      </template>
    </TableComponent>
    <GeneralClientDebtsData
      :list="debts"
      title="Баланс"
      style="max-width: 500px; margin: 0 auto"
    />
    <DialogAddDebtPaymentEntry
      v-model:entry-data="dialogAddDebtPaymentEntryData"
      v-model:show-dialog="showDialogAddDebtPaymentEntry"
    />
    <DialogAddDebtPayEntry
      v-model:entry-data="dialogAddDebtPayEntryData"
      v-model:show-dialog="showDialogAddDebtPayEntry"
    />
    <DialogAddDebEntry
      v-model:entry-data="dialogAddDebtEntryData"
      v-model:show-dialog="showDialogAddDebtEntry"
    />
  </div>
</template>

<script>
import ExportDataMixin from "src/mixins/ExportData";
import showNotif from "src/mixins/showNotif";
import { numberFormat } from "src/utils";
import TableComponent from "src/components/Elements/Table/Table.vue";
import GeneralClientDebtsData from "src/components/CargoDebts/GeneralClientDebtsData.vue";
import UpdateBtn from "src/components/Buttons/UpdateBtn.vue";
import RoundBtn from "src/components/Buttons/RoundBtn.vue";
import DialogAddDebtPaymentEntry from "src/components/CargoDebts/Dialogs/DialogAddDebtPaymentEntry.vue";
import DialogAddDebEntry from "src/components/CargoDebts/Dialogs/DialogAddDebEntry.vue";
import DialogAddDebtPayEntry from "src/components/CargoDebts/Dialogs/DialogAddDebtPayEntry.vue";
import MenuDebt from "src/components/CargoDebts/MenuDebt.vue";
import {
  sumBy,
  get,
  includes,
  first,
  forEach,
  orderBy,
  find,
  map,
  size,
  isEmpty,
} from "lodash";
import { useCargoDebtsStore } from "stores/cargo-debts";
const cargoDebtsStore = useCargoDebtsStore();

export default {
  name: "DebtsComponent",
  components: {
    TableComponent,
    GeneralClientDebtsData,
    UpdateBtn,
    RoundBtn,
    DialogAddDebtPaymentEntry,
    DialogAddDebEntry,
    DialogAddDebtPayEntry,
    MenuDebt,
  },
  mixins: [ExportDataMixin, showNotif],
  props: {
    refresh: {
      type: Function,
      default: () => {},
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loadingBtn: false,
      debtsTableProperties: {
        columns: [
          {
            name: "created_at",
            label: "Дата",
            align: "center",
            field: "created_at",
            sortable: true,
          },
          {
            name: "code_client_name",
            label: "Клиент",
            align: "center",
            field: "code_client_name",
            sortable: true,
          },
          {
            name: "type",
            label: "Тип",
            align: "center",
            field: "type",
            sortable: true,
          },
          {
            name: "sum",
            label: "Сумма",
            field: "sum",
            align: "center",
            sortable: true,
          },
          {
            name: "commission",
            label: "Комиссия",
            field: "commission",
            align: "center",
            sortable: true,
          },
          {
            name: "paid",
            label: "Оплачен",
            field: "paid",
            align: "center",
            sortable: true,
          },
          {
            name: "get_pay_user_name",
            label: "Пользователь",
            field: "get_pay_user_name",
            align: "center",
            sortable: true,
          },
          {
            name: "notation",
            label: "Примечания",
            field: "notation",
            align: "center",
            sortable: true,
          },
        ],
      },
      debtsTableReactiveProperties: {
        selected: [],
        visibleColumns: [
          "code_client_name",
          "paid",
          "created_at",
          "type",
          "sum",
          "notation",
          "commission",
          "get_pay_user_name",
        ],
        title: "",
      },
      showDialogAddDebtPaymentEntry: false,
      dialogAddDebtPaymentEntryData: {},
      showDialogAddDebtEntry: false,
      dialogAddDebtEntryData: {},
      dialogAddDebtPayEntryData: {},
      showDialogAddDebtPayEntry: false,
    };
  },
  computed: {
    debts() {
      return cargoDebtsStore.getDebts;
    },
    currentCodeClientId() {
      return cargoDebtsStore.getCurrentCodeClientId;
    },
    titleTable() {
      return `Сумма: ${sumBy(this.debts, "sum")}, %: ${sumBy(
        this.debts,
        "commission",
      )}`;
    },
  },
  methods: {
    numberFormat,
    viewDebtEditDialog(data, event) {
      if (!includes(get(event, "target.classList"), "select_checkbox")) {
        if (data.row.type) {
          this.dialogAddDebtPaymentEntryData = data;
          this.showDialogAddDebtPaymentEntry = true;
        } else {
          this.dialogAddDebtEntryData = data;
          this.showDialogAddDebtEntry = true;
        }
      }
    },
    async exportZeroDebtData() {
      const sumAll = (arr) => {
        let sumElem = 0;
        arr.forEach((item) => {
          sumElem += item.sum;
        });
        return Math.floor(sumElem);
      };
      const { getUrl } = await import("src/tools/url");
      const reversedItems = this.debts.toReversed();
      const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const arr = [];
      let firstDate = null;
      reversedItems.forEach(({ chang }, index) => {
        if (!arr.length) {
          firstDate = chang;
          const d1 = new Intl.DateTimeFormat("en-US", options).format(
            new Date(firstDate),
          );
          const fil = reversedItems.filter((elem) => {
            const d2 = new Intl.DateTimeFormat("en-US", options).format(
              new Date(elem.chang),
            );
            return new Date(d1).getTime() === new Date(d2).getTime();
          });
          arr.push({ date: chang, sum: sumAll(fil), index });
        } else {
          const d1 = new Intl.DateTimeFormat("en-US", options).format(
            new Date(chang),
          );
          const fil = reversedItems.filter((elem) => {
            const d2 = new Intl.DateTimeFormat("en-US", options).format(
              new Date(elem.chang),
            );
            return new Date(d2).getTime() <= new Date(d1).getTime();
          });
          arr.push({ date: chang, sum: sumAll(fil), index });
        }
      });
      const reversedItems2 = arr.toReversed();
      const find = reversedItems2.find((item) => item.sum == 0);

      const clientName = `${get(
        first(reversedItems),
        "code_client_name",
      )} код долги`;

      this.exportDataToExcel(
        getUrl("exportDebtsData"),
        {
          data: reversedItems.slice(find.index + 1),
        },
        `${clientName}.xlsx`,
      );
    },
    async exportFaxData(selected) {
      let data = selected;
      if (isEmpty(data)) {
        data = this.debts;
      } else {
        const searchData = cargoDebtsStore.getDebtsForSearch;
        const newArr = [];
        forEach(data, ({ id }) => {
          newArr.push(find(searchData, { id }));
        });
        data = orderBy(newArr, (item) => new Date(item.created_at), "desc");
      }
      if (!isEmpty(data)) {
        this.loadingBtn = true;
        const clientName = `${get(first(data), "code_client_name")} код долги`;
        const { getUrl } = await import("src/tools/url");
        this.exportDataToExcel(
          getUrl("exportDebtsData"),
          {
            data,
          },
          `${clientName}.xlsx`,
        ).finally(() => {
          this.loadingBtn = false;
        });
      }
    },
    destroyDebtEntry(data) {
      const ids = map(data, "id");
      if (!isEmpty(ids)) {
        this.showNotif(
          "warning",
          size(ids) > 1 ? "Удалить записи?" : "Удалить запись?",
          "center",
          [
            {
              label: "Отмена",
              color: "white",
              handler: () => {
                this.debtsTableReactiveProperties.selected = [];
              },
            },
            {
              label: "Удалить",
              color: "white",
              handler: async () => {
                const { getUrl } = await import("src/tools/url");
                this.$q.loading.show();
                this.$axios
                  .post(getUrl("deleteDebtEntry"), { ids })
                  .then(() => {
                    cargoDebtsStore.deleteDebtEntry(ids);
                    this.debtsTableReactiveProperties.selected = [];
                    this.$q.loading.hide();
                    this.showNotif(
                      "success",
                      size(ids) > 1
                        ? "Записи успешно удалены."
                        : "Запись успешно удалена.",
                      false,
                    );
                  })
                  .catch(() => {
                    this.$q.loading.hide();
                    console.error("Ошибка запроса - deleteDebtEntry");
                  });
              },
            },
          ],
        );
      }
    },
    pay(data) {
      if (!data.type && !data.paid) {
        this.dialogAddDebtPayEntryData = data;
        this.showDialogAddDebtPayEntry = true;
      }
      this.debtsTableReactiveProperties.selected = [];
    },
    async paymentsAll(id) {
      if (id) {
        this.showNotif(
          "warning",
          "Перевести все данные клиента в статус оплаты?",
          "center",
          [
            {
              label: "Отмена",
              color: "white",
              handler: () => {},
            },
            {
              label: "OK",
              color: "white",
              handler: async () => {
                const { getUrl } = await import("src/tools/url");
                this.$q.loading.show();
                this.$axios
                  .get(`${getUrl("debtsPaymentsAll")}/${id}`)
                  .then(({ data: { debts } }) => {
                    cargoDebtsStore.updateDebtEntry(debts);
                    this.$q.loading.hide();
                    this.showNotif(
                      "success",
                      "Данные по карго все переведены в статус оплаты.",
                      false,
                    );
                  })
                  .catch(() => {
                    this.$q.loading.hide();
                  });
              },
            },
          ],
        );
      }
    },
  },
};
</script>
