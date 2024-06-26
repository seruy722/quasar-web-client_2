<template>
  <q-page data-vue-component-name="CodePrice" class="q-pa-md">
    <PullRefresh @refresh="refresh">
      <TableComponent
        :table-properties="transferTableProperties"
        :table-data="codesPriceData"
        :table-reactive-properties="transferTableReactiveProperties"
        :loading="loading"
        title="Цены"
      >
        <template #top-buttons>
          <div class="row q-gutter-sm">
            <RoundBtn
              color="teal"
              icon="add_box"
              tooltip="Добавить"
              @round-btn-click="addCodeWithCategory"
            />
            <UpdateBtn :func="refresh" />
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
              style="border-radius: 30px; border: 1px solid"
              expand-icon-class="text-white"
            >
              <template #header>
                <q-item-section>
                  <q-item-label :lines="2">
                    {{ props.row.code }}
                  </q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ props.row.data.length }}
                  </q-item-label>
                </q-item-section>
              </template>

              <q-list dense bordered separator class="q-ma-md">
                <q-item class="text-bold text-center">
                  <q-item-section>
                    <q-item-label>Категория</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>За кг</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>'За кг'</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Комиссия</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Обновлено</q-item-label>
                  </q-item-section>
                  <q-item-section side> Управление </q-item-section>
                </q-item>

                <q-item
                  v-for="(elem, i) in props.row.data"
                  :key="i"
                  class="text-center"
                >
                  <q-item-section>
                    <q-item-label :lines="3">
                      <q-badge color="positive">
                        {{ elem.category_name }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ elem.for_kg }}</q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ elem.for_place }}</q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ elem.commission }}</q-item-label>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ elem.updated_at }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row">
                      <IconBtn
                        flat
                        dense
                        icon="history"
                        tooltip="История"
                        @icon-btn-click="getCodePriceHistory(elem.id)"
                      />
                      <IconBtn
                        flat
                        dense
                        icon="edit"
                        color="teal"
                        tooltip="Редактировать"
                        @icon-btn-click="openDialogAddCodePriceForUpdate(elem)"
                      />
                      <IconBtn
                        flat
                        dense
                        icon="delete"
                        color="negative"
                        tooltip="Удалить"
                        @icon-btn-click="deleteCodePrice(elem)"
                      />
                    </div>
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
            @click.stop="viewEditDialog(props, $event)"
          >
            <q-td auto-width class="select_checkbox">
              <q-checkbox v-model="props.selected" dense />
            </q-td>

            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>

            <!--            <q-td-->
            <!--              key="actions"-->
            <!--              :props="props"-->
            <!--            >-->
            <!--            </q-td>-->
          </q-tr>
        </template>
      </TableComponent>
      <DialogAddCodePrice
        v-model:show-dialog="showDialogAddCodePrice"
        v-model:code-id="codeId"
        v-model:entry-data="entryData"
      />
      <DialogAddNewCodePrice v-model:show-dialog="showDialogAddNewCodePrice" />

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
            <CodePriceHistory :history-data="codePriceHistoryData" />
          </q-card-section>
        </q-card>
      </DialogComponent>
      <DialogComponent
        :dialog="dialogViewCodeData"
        :persistent="true"
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card style="width: 100%; max-width: 800px">
          <q-bar>
            {{ codeName }}
            <q-space />
            <q-btn
              dense
              flat
              icon="close"
              color="negative"
              @click="dialogViewCodeData = false"
            />
          </q-bar>
          <q-list dense bordered separator class="q-ma-md">
            <q-item class="text-bold text-center">
              <q-item-section>
                <q-item-label>Категория</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>За кг</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>'За кг'</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>Комиссия</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>Обновлено</q-item-label>
              </q-item-section>

              <q-item-section side> Управление </q-item-section>
            </q-item>

            <q-item v-for="(elem, i) in codeData" :key="i" class="text-center">
              <q-item-section>
                <q-item-label :lines="3">
                  <q-badge color="positive">
                    {{ elem.category_name }}
                  </q-badge>
                </q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ elem.for_kg }}</q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ elem.for_place }}</q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ elem.commission }}</q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ elem.updated_at }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row">
                  <IconBtn
                    flat
                    dense
                    icon="history"
                    tooltip="История"
                    @icon-btn-click="getCodePriceHistory(elem.id)"
                  />
                  <IconBtn
                    flat
                    dense
                    icon="edit"
                    color="teal"
                    tooltip="Редактировать"
                    @icon-btn-click="openDialogAddCodePriceForUpdate(elem)"
                  />
                  <IconBtn
                    flat
                    dense
                    icon="delete"
                    color="negative"
                    tooltip="Удалить"
                    @icon-btn-click="deleteCodePrice(elem)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </DialogComponent>
    </PullRefresh>
  </q-page>
</template>

<script>
import { getUrl } from "src/tools/url";
import showNotif from "src/mixins/showNotif";
import {
  setMethodLabel,
  setStatusLabel,
  setFormatedDate,
  prepareHistoryData,
} from "src/utils/FrequentlyCalledFunctions";
import { callFunction } from "src/utils";
import TableComponent from "components/Elements/Table/Table.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import RoundBtn from "src/components/Buttons/RoundBtn.vue";
import UpdateBtn from "src/components/Buttons/UpdateBtn.vue";
import PullRefresh from "src/components/PullRefresh.vue";
import DialogAddCodePrice from "src/components/Dialogs/DialogAddCodePrice.vue";
import CodePriceHistory from "src/components/History/CodePriceHistory.vue";
import DialogAddNewCodePrice from "src/components/Dialogs/DialogAddNewCodePrice.vue";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import { reduce, toLower, includes, forEach, isEmpty, get } from "lodash";
import { useCodesPriceStore } from "stores/codes-prices";
const codesPriceStore = useCodesPriceStore();

export default {
  name: "CodePrice",
  components: {
    TableComponent,
    UpdateBtn,
    IconBtn,
    DialogAddCodePrice,
    CodePriceHistory,
    DialogComponent,
    DialogAddNewCodePrice,
    PullRefresh,
    RoundBtn,
  },
  mixins: [showNotif],
  data() {
    return {
      loading: false,
      showDialogAddCodePrice: false,
      showDialogAddNewCodePrice: false,
      codeId: 0,
      entryData: {},
      codePriceHistoryData: {},
      dialogHistory: false,
      search: null,
      codesPricesData: [],
      transferTableProperties: {
        columns: [
          {
            name: "code",
            label: "Код",
            align: "center",
            field: "code",
            sortable: true,
            // sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
          },
          // {
          //     name: 'actions',
          //     label: 'Действия',
          //     field: 'actions',
          //     align: 'center',
          //     sortable: true,
          // },
        ],
      },
      transferTableReactiveProperties: {
        selected: [],
        visibleColumns: ["code"],
      },
      dialogViewCodeData: false,
      codeData: [],
      codeName: null,
    };
  },
  computed: {
    codesPriceData() {
      return codesPriceStore.getCodesPrices;
    },
  },
  watch: {
    codesPriceData(val) {
      this.codesPricesData = val;
    },
    search: {
      handler: function set(val) {
        if (!val) {
          this.codesPricesData = this.codesPriceData;
        } else {
          this.codesPricesData = reduce(
            this.codesPriceData,
            (result, item, index) => {
              if (includes(toLower(index), toLower(val))) {
                result[index] = item;
              }
              return result;
            },
            {},
          );
        }
      },
      immediate: true,
    },
  },
  created() {
    this.getCodesPrices();
  },
  methods: {
    addCodeWithCategory() {
      this.showDialogAddNewCodePrice = true;
    },
    getCodesPrices() {
      this.loading = true;
      return this.$axios
        .get(getUrl("getCodesPrices"))
        .then(({ data: { codesPrice } }) => {
          forEach(codesPrice, (price) => {
            setFormatedDate(price, ["updated_at"]);
          });
          codesPriceStore.setCodesPrices(codesPrice);
          this.loading = false;
        })
        .catch((errors) => {
          console.error("Ошибка запроса getClientsPrices", errors);
          this.loading = false;
        });
    },
    openDialogAddCodePrice(id) {
      this.showDialogAddCodePrice = true;
      this.codeId = id;
    },
    openDialogAddCodePriceForUpdate(data) {
      this.showDialogAddCodePrice = true;
      this.codeId = data.code_id;
      this.entryData = data;
    },
    deleteCodePrice(elem) {
      this.showNotif(
        "warning",
        `Удалить категорию - ${elem.category_name}?`,
        "center",
        [
          {
            label: "Отмена",
            color: "white",
            handler: () => {},
          },
          {
            label: "Удалить",
            color: "white",
            handler: () => {
              this.$q.loading.show();
              this.$axios
                .delete(`${getUrl("deleteCodePrice")}/${elem.id}`)
                .then(() => {
                  codesPriceStore.deleteCodePrice(elem);
                  this.$q.loading.hide();
                })
                .catch((errors) => {
                  console.error("Ошибка запроса deleteCodePrice", errors);
                  this.$q.loading.hide();
                });
            },
          },
        ],
      );
    },
    setAdditionalData(data) {
      return setMethodLabel(
        setStatusLabel(setFormatedDate(data, ["created_at", "issued_by"])),
      );
    },
    async getCodePriceHistory(id) {
      this.$q.loading.show();
      await this.$axios
        .get(`${getUrl("getCodePriceHistory")}/${id}`)
        .then(({ data: { codePriceHistory } }) => {
          if (!isEmpty(codePriceHistory)) {
            this.$q.loading.hide();
            this.dialogHistory = true;
            const historyData = prepareHistoryData(
              [
                {
                  label: "Категория",
                  name: "category_name",
                },
                {
                  label: "За кг",
                  name: "for_kg",
                },
                {
                  label: "За кг",
                  name: "for_place",
                },
                {
                  label: "Пользователь",
                  name: "user_name",
                },
              ],
              codePriceHistory,
            );
            historyData.historyData = this.setAdditionalData(
              historyData.historyData,
            );
            this.codePriceHistoryData = historyData;
          } else {
            this.$q.loading.hide();
            this.showNotif("info", "По этому коду нет истории.", "center");
          }
        })
        .catch(() => {
          console.error(
            "Ошибка при получении данных истории - getCodePriceHistory",
          );
        });
    },
    async refresh(done) {
      if (!done) {
        this.$q.loading.show();
      }
      this.getCodesPrices()
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
    viewEditDialog(elem, event) {
      if (!includes(get(event, "target.classList"), "select_checkbox")) {
        this.dialogViewCodeData = true;
        this.codeName = elem.row.code;
        this.codeData = elem.row.data;
      }
    },
  },
};
</script>
