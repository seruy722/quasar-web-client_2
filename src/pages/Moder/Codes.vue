<template>
  <q-page data-vue-component-name="CodesPage">
    <PullRefresh @refresh="refresh">
      <TableComponent
        :table-properties="transferTableProperties"
        :table-data="allCodes"
        :table-reactive-properties="customerTableReactiveProperties"
        :loading="loading"
        title="Клиенты"
      >
        <template #top-buttons>
          <div class="row q-gutter-sm">
            <RoundBtn
              color="primary"
              icon="sync"
              tooltip="Обновить"
              @round-btn-click="refresh"
            />
            <MenuComponent :items="['Код', 'Клиента']" />
            <RoundBtn
              color="positive"
              tooltip="Excel"
              icon="explicit"
              @round-btn-click="exportCustomers"
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
              style="border-radius: 30px; border: 1px solid #26a69a"
              :class="`border_${
                props.row.customers.length ? 'secondary' : 'grey'
              }`"
              :header-class="`bg-${
                props.row.customers.length ? 'secondary' : 'grey'
              } text-white`"
            >
              <template #header>
                <!--                <q-item-section avatar>-->
                <!--                  <q-checkbox-->
                <!--                    v-model="props.selected"-->
                <!--                    dense-->
                <!--                  />-->
                <!--                </q-item-section>-->

                <q-item-section>
                  <q-item-label :lines="2">
                    {{ props.row.code }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label :lines="2">
                    <!--                    <IconBtn-->
                    <!--                      dense-->
                    <!--                      icon="add_circle"-->
                    <!--                      tooltip="Добавить клиента"-->
                    <!--                      @icon-btn-click="openClientAddDialog(props)"-->
                    <!--                    />-->
                    <IconBtn
                      dense
                      icon="history"
                      tooltip="История"
                      @icon-btn-click="getCodeHistory(props.row.id, props.cols)"
                    />
                  </q-item-label>
                </q-item-section>
              </template>

              <q-list separator dense>
                <q-item
                  v-for="col in props.cols.filter(
                    (col) => col.name !== 'desc' && col.name !== 'phones',
                  )"
                  :key="col.name"
                >
                  <q-item-section>
                    <q-item-label>{{ `${col.label}:` }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label v-if="col.name === 'code'" :lines="3">
                      <q-badge>{{ col.value }}</q-badge>
                    </q-item-label>
                    <q-item-label v-else-if="col.name === 'cities'">
                      <ListNumbered :values="compactArray(col.value)" />
                    </q-item-label>
                    <q-item-label v-else :lines="3">
                      {{ col.value }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section class="text-bold text-center">
                    <div class="row items-center justify-center">
                      <span>Клиенты</span>
                      <IconBtn
                        dense
                        icon="add_box"
                        tooltip="Добавить клиента"
                        @icon-btn-click="openClientAddDialog(props)"
                      />
                    </div>
                  </q-item-section>
                </q-item>

                <q-item
                  v-for="(item, i) in props.row.customers"
                  :key="i"
                  clickable
                  @click="openClientEditDialog(item)"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="call"
                      color="positive"
                      @click.stop="call(item.phone)"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :lines="2">
                      {{ item.name }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ phoneNumberFilter(item.phone) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      <IconBtn
                        dense
                        icon="history"
                        tooltip="История"
                        @icon-btn-click="
                          getClientHistory(item.id, localProps.cols)
                        "
                      />
                      <IconBtn
                        dense
                        icon="delete"
                        tooltip="Удалить"
                        color="negative"
                        @icon-btn-click="destroyCustomer(item)"
                      />
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
            class="text-bold cursor-pointer"
            :class="`bg-${
              props.row.customers.length ? 'secondary' : 'grey'
            } text-white`"
            @click.stop="viewEditDialog(props, $event)"
          >
            <q-td auto-width class="select_checkbox">
              <q-checkbox v-model="props.selected" dense />
            </q-td>

            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>

            <q-td key="cities" :props="props">
              <ListNumbered :values="compactArray(props.row.cities)" />
            </q-td>

            <q-td key="phones" :props="props">
              <ListNumbered :values="props.row.phones" type="phones" />
            </q-td>

            <!--            <q-td-->
            <!--              key="user_name"-->
            <!--              :props="props"-->
            <!--            >-->
            <!--              {{ props.row.user_name }}-->
            <!--            </q-td>-->

            <q-td key="created_at" :props="props">
              {{ props.row.created_at }}
            </q-td>
          </q-tr>
        </template>
      </TableComponent>
      <DialogComponent :dialog="dialog" :persistent="true">
        <q-card style="min-width: 320px; width: 100%; max-width: 500px">
          <q-card-section class="row justify-between items-center bg-grey">
            <span class="text-h6">{{ dialogTitle }}</span>
            <div class="row">
              <IconBtn
                dense
                icon="add_box"
                color="teal"
                tooltip="Добавить клиента"
                @icon-btn-click="openClientAddDialog(localProps)"
              />
              <IconBtn
                dense
                icon="history"
                tooltip="История"
                @icon-btn-click="
                  getCodeHistory(localProps.row.id, localProps.cols)
                "
              />

              <IconBtn
                dense
                icon="clear"
                color="negative"
                tooltip="Закрыть"
                @icon-btn-click="cancel"
              />
            </div>
          </q-card-section>
          <q-item-section>
            <q-list v-if="localProps.row" separator dense>
              <q-item
                v-for="col in localProps.cols.filter(
                  (col) => col.name !== 'desc',
                )"
                :key="col.name"
              >
                <q-item-section>
                  <q-item-label>
                    {{ `${col.label}:` }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label v-if="col.name === 'code'" :lines="3">
                    <q-badge>{{ col.value }}</q-badge>
                  </q-item-label>
                  <q-item-label v-else-if="col.name === 'cities'">
                    <ListNumbered :values="compactArray(col.value)" />
                  </q-item-label>
                  <q-item-label v-else-if="col.name === 'phones'">
                    <ListNumbered :values="col.value" :type="col.name" />
                  </q-item-label>
                  <q-item-label v-else :lines="3">
                    {{ col.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                class="text-bold text-center"
                style="
                  border-bottom: 1px solid blue;
                  border-top: 1px solid blue;
                "
              >
                <q-item-section> Клиенты </q-item-section>
              </q-item>

              <q-item v-if="localProps.row.customers.length" class="text-bold">
                <q-item-section>
                  <q-item-label> Имя </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label> Телефон </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label> Действие </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-for="(item, i) in localProps.row.customers"
                :key="i"
                clickable
                @click="openClientEditDialog(item)"
              >
                <q-item-section>
                  <q-item-label :lines="2">
                    {{ `${i + 1}. ${item.name}` }}
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ phoneNumberFilter(item.phone) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <IconBtn
                      dense
                      icon="history"
                      tooltip="История"
                      @icon-btn-click="
                        getClientHistory(item.id, localProps.cols)
                      "
                    />
                    <IconBtn
                      dense
                      icon="delete"
                      tooltip="Удалить"
                      color="negative"
                      @icon-btn-click="destroyCustomer(item)"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-item-section>
          <Separator />
        </q-card>
      </DialogComponent>
      <DialogAddCode v-model:show-dialog="showCodeDialog" />

      <DialogComponent
        :dialog="dialogHistory"
        :persistent="true"
        :maximized="true"
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card style="max-width: 600px">
          <q-bar>
            <q-space />
            <IconBtn
              flat
              dense
              icon="close"
              tooltip="Закрыть"
              @icon-btn-click="dialogHistory = false"
            />
          </q-bar>

          <q-card-section class="q-pt-none">
            <CodeHistory :history-data="transferHistoryData" />
          </q-card-section>
        </q-card>
      </DialogComponent>
    </PullRefresh>
    <DialogAddClient
      v-model:show-dialog="showClientDialog"
      v-model:entry-data="localClientEditData"
      v-model:code-id="codeId"
    />
  </q-page>
</template>

<script>
import { getUrl } from "src/tools/url";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import showNotif from "src/mixins/showNotif";
import ExportDataMixin from "src/mixins/ExportData";
import { callFunction, createSpecialLink, phoneNumberFilter } from "src/utils";
import TransferMixin from "src/mixins/Transfer";
import {
  setMethodLabel,
  setStatusLabel,
  setFormatedDate,
  prepareHistoryData,
  getClientCodes,
} from "src/utils/FrequentlyCalledFunctions";
import TableComponent from "components/Elements/Table/Table.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import RoundBtn from "src/components/Buttons/RoundBtn.vue";
import PullRefresh from "src/components/PullRefresh.vue";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import Separator from "src/components/Separator.vue";
import DialogAddCode from "src/components/Dialogs/DialogAddCode.vue";
import DialogAddClient from "src/components/Dialogs/DialogAddClient.vue";
import MenuComponent from "src/components/Menu.vue";
import CodeHistory from "src/components/History/CodeHistory.vue";
import ListNumbered from "src/components/ListNumbered.vue";
import { get, isEmpty, compact, includes, isFunction, map } from "lodash";
import { useCodesStore } from "stores/codes";
const codesStore = useCodesStore();

export default {
  name: "CodesPage",
  components: {
    TableComponent,
    DialogComponent,
    IconBtn,
    Separator,
    DialogAddCode,
    DialogAddClient,
    MenuComponent,
    PullRefresh,
    CodeHistory,
    ListNumbered,
    RoundBtn,
  },
  mixins: [CheckErrorsMixin, showNotif, ExportDataMixin, TransferMixin],
  data() {
    return {
      loading: false,
      codeId: 0,
      localClientEditData: {},
      showClientDialog: false,
      dialogHistory: false,
      transferHistoryData: {
        cols: {},
        transferHistory: [],
      },
      localProps: {},
      showCodeDialog: false,
      dialog: false,
      transferTableProperties: {
        columns: [
          {
            name: "code",
            label: "Код",
            align: "center",
            field: "code",
            sortable: true,
            sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
          },
          {
            name: "cities",
            label: "Города",
            field: "cities",
            align: "center",
            sortable: true,
          },
          {
            name: "phones",
            label: "Телефоны",
            field: "phones",
            align: "center",
            sortable: true,
          },
          // {
          //     name: 'city',
          //     label: 'Город',
          //     field: 'city',
          //     align: 'center',
          //     sortable: true,
          // },
          // {
          //     name: 'user_name',
          //     label: 'Пользователь',
          //     field: 'user_name',
          //     align: 'center',
          //     sortable: true,
          // },
          {
            name: "created_at",
            label: "Добавлен",
            field: "created_at",
            align: "center",
            sortable: true,
          },
        ],
      },
      customerTableReactiveProperties: {
        selected: [],
        visibleColumns: ["code", "cities", "phones", "created_at"],
      },
    };
  },
  computed: {
    allCodes() {
      return codesStore.getCodesWithCustomers;
    },
    dialogTitle() {
      return get(this.localProps, "row.client_name") || "Просмотр";
    },
  },
  mounted() {
    this.getCodes();
  },
  methods: {
    phoneNumberFilter,
    call(phone) {
      const link = createSpecialLink(phone, "tel");
      link.click();
    },
    compactArray(array) {
      if (!isEmpty(array)) {
        return compact(array);
      }
      return null;
    },
    openClientEditDialog(val) {
      this.localClientEditData = val;
      this.showClientDialog = true;
    },
    openClientAddDialog(val) {
      this.codeId = get(val, "row.id");
      this.showClientDialog = true;
    },
    viewEditDialog(val, event) {
      if (!includes(get(event, "target.classList"), "select_checkbox")) {
        if (val) {
          this.localProps = val;
          this.customerTableReactiveProperties.selected = [];
          setTimeout(() => {
            val.selected = !val.selected;
          }, 100);
          this.$q.loading.show();
          Promise.all([getClientCodes(codesStore)]).then(() => {
            this.openCloseDialog(true);
            this.$q.loading.hide();
          });
        } else {
          this.openCloseDialog(true);
          this.localProps = {};
        }
      }
    },
    getCodes() {
      if (isEmpty(this.allCodes)) {
        this.loading = true;
        codesStore
          .setCodesWithCustomers()
          .catch((errors) => {
            console.error("Ошибка", errors);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    setAdditionalData(data) {
      return setMethodLabel(
        setStatusLabel(setFormatedDate(data, ["created_at", "issued_by"])),
      );
    },
    openCloseDialog(val) {
      this.dialog = val;
    },
    cancel() {
      this.openCloseDialog(false);
      this.localProps.selected = false;
    },
    async refresh(done) {
      if (!isFunction(done)) {
        this.$q.loading.show();
      }
      await codesStore
        .setCodesWithCustomers()
        .then(() => {
          this.showNotif("success", "Данные успешно обновлены.", "center");
        })
        .catch((errors) => {
          console.error("Ошибка", errors);
        })
        .finally(() => {
          callFunction(done);
          this.$q.loading.hide();
        });
    },
    async getCodeHistory(codeId, cols) {
      cols.push({
        label: "Пользователь",
        name: "user_name",
      });
      this.$q.loading.show();
      await this.$axios
        .get(`${getUrl("codeHistory")}/${codeId}`)
        .then(({ data: { codeHistory } }) => {
          if (!isEmpty(codeHistory)) {
            this.$q.loading.hide();
            this.dialogHistory = true;
            const historyData = prepareHistoryData(cols, codeHistory);
            historyData.historyData = this.setAdditionalData(
              historyData.historyData,
            );
            this.transferHistoryData = historyData;
          } else {
            this.$q.loading.hide();
            this.showNotif("info", "По этому коду нет истории.", "center");
          }
        })
        .catch(() => {
          console.error("Ошибка при получении данных истории.");
        });
    },
    async getClientHistory(customerId) {
      const newCols = [
        {
          name: "client_name",
          label: "Код",
        },
        {
          name: "name",
          label: "Имя",
        },
        {
          name: "phone",
          label: "Телефон",
        },
        {
          name: "city_name",
          label: "Город",
        },
        {
          name: "sex",
          label: "Пол",
        },
        {
          name: "created_at",
          label: "Добавлен",
        },
        {
          label: "Пользователь",
          name: "user_name",
        },
      ];

      this.$q.loading.show();
      await this.$axios
        .get(`${getUrl("getCustomerHistory")}/${customerId}`)
        .then(({ data: { customerHistory } }) => {
          if (!isEmpty(customerHistory)) {
            this.$q.loading.hide();
            this.dialogHistory = true;
            const historyData = prepareHistoryData(newCols, customerHistory);
            historyData.historyData = this.setAdditionalData(
              historyData.historyData,
            );
            this.transferHistoryData = historyData;
          } else {
            this.$q.loading.hide();
            this.showNotif("info", "По этому клиенту нет истории.", "center");
          }
        })
        .catch(() => {
          console.error("Ошибка при получении данных истории.");
        });
    },
    destroyCustomer({ id, name, code_id: codeId }) {
      this.showNotif("warning", `Удалить клиента - ${name} ?`, "center", [
        {
          label: "Отмена",
          color: "white",
          handler: () => {},
        },
        {
          label: "Удалить",
          color: "white",
          handler: async () => {
            this.$q.loading.show();
            await codesStore
              .deleteCustomer({
                id,
                code_id: codeId,
              })
              .then(() => {
                this.$q.loading.hide();
                this.showNotif(
                  "success",
                  `Клиент ${name} успешно удален.`,
                  "center",
                );
              })
              .catch(() => {
                this.$q.loading.hide();
                console.error("Ошибка запроса - destroyCustomerEntry");
              });
          },
        },
      ]);
    },
    exportCustomers() {
      if (!isEmpty(this.allCodes)) {
        this.exportDataToExcel(
          getUrl("exportCustomers"),
          {
            ids: map(this.customerTableReactiveProperties.selected, "id"),
          },
          "Клиенты.xlsx",
        );
      }
    },
  },
};
</script>

<style lang="scss">
.border_red {
  border-color: $red !important;
}

.border_positive {
  border-color: $positive !important;
}

.border_warning {
  border-color: $warning !important;
}

.border_grey {
  border-color: $grey !important;
}

.border_info {
  border-color: $info !important;
}
</style>
