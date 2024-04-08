<template>
  <q-page data-vue-component-name="StatisticsComponent">
    <q-list bordered separator class="rounded-borders">
      <q-expansion-item
        expand-separator
        label="Доходы и расходы по месяцам"
        @before-show="fetchStatistics"
      >
        <q-card>
          <q-card-section>
            <!--            <div id="chart" />-->
            <TableComponent
              :table-properties="cargoTableProperties"
              :table-data="tasks"
              :table-reactive-properties="cargoTableReactiveProperties"
              title="Расходы"
            >
              <template #top-buttons>
                <MenuBtn :list="menuList">
                  <q-menu transition-show="scale" transition-hide="scale">
                    <q-list separator style="min-width: 100px">
                      <q-item
                        v-close-popup
                        clickable
                        @click="showDialogAddExpense = true"
                      >
                        <q-item-section avatar>
                          <q-icon name="add" color="negative" />
                        </q-item-section>
                        <q-item-section>Добавить расход</q-item-section>
                      </q-item>
                      <q-item
                        v-close-popup
                        clickable
                        @click="showDialogAddExpensePlus = true"
                      >
                        <q-item-section avatar>
                          <q-icon name="add" color="positive" />
                        </q-item-section>
                        <q-item-section>Добавить доход</q-item-section>
                      </q-item>
                      <q-item
                        v-show="cargoTableReactiveProperties.selected.length"
                        v-close-popup
                        clickable
                        @click="
                          destroyEntry(
                            cargoTableReactiveProperties.selected,
                            tasks,
                          )
                        "
                      >
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Удалить</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </MenuBtn>
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
                        <q-item-label>
                          {{ props.row.date }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section>
                        <!--                <q-item-label>-->
                        <!--                  {{ props.row.start_sum }}-->
                        <!--                </q-item-label>-->
                        <q-item-label>
                          <q-badge
                            :color="
                              sumProfit(
                                props.row.end_sum,
                                props.row.start_sum,
                              ) > 0
                                ? 'positive'
                                : 'warning'
                            "
                          >
                            {{
                              sumProfit(props.row.end_sum, props.row.start_sum)
                            }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>

                      <q-item-section>
                        <!--                <q-item-label>-->
                        <!--                  {{ props.row.end_sum }}-->
                        <!--                </q-item-label>-->
                        <q-item-label>
                          <q-badge color="negative">
                            {{ sumExpenses(props.row.data) }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>
                    </template>

                    <q-list
                      dense
                      separator
                      bordered
                      padding
                      class="rounded-borders"
                    >
                      <q-item>
                        <q-item-section>
                          <q-item-label> Название </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label> Сумма </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label> Дата </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-for="(item, index) in props.row.data"
                        :key="index"
                      >
                        <q-item-section>
                          <q-item-label>
                            {{ item.expense_name }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label>
                            {{ item.sum }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label>
                            {{ formatToDotDate(item.created_at) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </div>
              </template>

              <template #inner-body="{ props }">
                <q-tr :props="props" class="cursor-pointer">
                  <q-td auto-width class="select_checkbox">
                    <q-btn
                      size="sm"
                      color="accent"
                      round
                      dense
                      :icon="props.expand ? 'remove' : 'add'"
                      @click="props.expand = !props.expand"
                    />
                  </q-td>

                  <q-td key="date" :props="props">
                    {{ props.row.date }}
                  </q-td>

                  <q-td key="start_sum" :props="props">
                    <q-badge
                      :color="
                        sumProfit(props.row.end_sum, props.row.start_sum) > 0
                          ? 'positive'
                          : 'warning'
                      "
                    >
                      {{ sumProfit(props.row.end_sum, props.row.start_sum) }}
                    </q-badge>
                  </q-td>

                  <q-td key="end_sum" :props="props">
                    <q-badge color="negative">
                      {{ sumExpenses(props.row.data) }}
                    </q-badge>
                  </q-td>
                </q-tr>
                <q-tr v-show="props.expand" :props="props">
                  <q-td colspan="100%">
                    <q-list
                      dense
                      separator
                      bordered
                      padding
                      class="rounded-borders"
                    >
                      <q-item>
                        <q-item-section>
                          <q-item-label> Название </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label> Сумма </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label> Дата </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-for="(item, index) in props.row.data"
                        :key="index"
                      >
                        <q-item-section>
                          <q-item-label>
                            {{ item.expense_name }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label>
                            {{ item.sum }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section>
                          <q-item-label>
                            {{ formatToDotDate(item.created_at) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-td>
                </q-tr>
              </template>
            </TableComponent>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!--      <q-expansion-item-->
      <!--        expand-separator-->
      <!--        icon="signal_wifi_off"-->
      <!--        label="Wifi settings"-->
      <!--      >-->
      <!--        <q-card>-->
      <!--          <q-card-section>-->
      <!--            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti-->
      <!--            commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste-->
      <!--            eveniet doloribus ullam aliquid.-->
      <!--          </q-card-section>-->
      <!--        </q-card>-->
      <!--      </q-expansion-item>-->

      <!--      <q-expansion-item-->
      <!--        expand-separator-->
      <!--        icon="drafts"-->
      <!--        label="Drafts"-->
      <!--        header-class="text-purple"-->
      <!--      >-->
      <!--        <q-card>-->
      <!--          <q-card-section>-->
      <!--            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti-->
      <!--            commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste-->
      <!--            eveniet doloribus ullam aliquid.-->
      <!--          </q-card-section>-->
      <!--        </q-card>-->
      <!--      </q-expansion-item>-->

      <!--      <q-expansion-item icon="assessment" label="Disabled" disable>-->
      <!--        <q-card>-->
      <!--          <q-card-section>-->
      <!--            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti-->
      <!--            commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste-->
      <!--            eveniet doloribus ullam aliquid.-->
      <!--          </q-card-section>-->
      <!--        </q-card>-->
      <!--      </q-expansion-item>-->
    </q-list>
    <DialogAddExpense v-model:show-dialog="showDialogAddExpense" />
    <DialogAddExpensePlus v-model:show-dialog="showDialogAddExpensePlus" />
  </q-page>
</template>

<script>
import showNotif from "src/mixins/showNotif";
import { formatToDotDate } from "src/utils/formatDate";
import TableComponent from "src/components/Elements/Table/Table.vue";
import MenuBtn from "src/components/Buttons/MenuBtn.vue";
import DialogAddExpense from "src/components/Dialogs/DialogAddExpense.vue";
import DialogAddExpensePlus from "src/components/Dialogs/DialogAddExpensePlus.vue";
import { isEmpty, sumBy, size, map, includes, get } from "lodash";
import { useStatisticsStore } from "stores/statistics";
const statisticsStore = useStatisticsStore();
import { useTasksStore } from "stores/tasks";
const tasksStore = useTasksStore();

export default {
  name: "StatisticsComponent",
  components: {
    DialogAddExpense,
    TableComponent,
    MenuBtn,
    DialogAddExpensePlus,
  },
  mixins: [showNotif],
  data() {
    return {
      cargoTableProperties: {
        columns: [
          {
            name: "date",
            label: "Месяц",
            align: "center",
            field: "date",
            sortable: true,
          },
          {
            name: "start_sum",
            label: "Доход",
            align: "center",
            field: "start_sum",
            sortable: true,
          },
          {
            name: "end_sum",
            label: "Затраты",
            align: "center",
            field: "end_sum",
            sortable: true,
          },
        ],
      },
      cargoTableReactiveProperties: {
        selected: [],
        visibleColumns: ["date", "start_sum", "end_sum"],
        title: "",
      },
      menuList: [],
      showDialogAddExpense: false,
      showDialogAddExpensePlus: false,
    };
  },
  computed: {
    tasks() {
      return statisticsStore.getStatistics;
    },
  },
  methods: {
    fetchStatistics() {
      if (isEmpty(this.tasks)) {
        this.$q.loading.show();
        statisticsStore.fetchStatistics().finally(() => {
          this.$q.loading.hide();
        });
      }
    },
    sumExpenses(data) {
      return sumBy(data, "sum") * -1;
    },
    sumProfit(end, start) {
      // return (start && end) && end > start ? end - start : 0;
      return end - start;
    },
    formatToDotDate,
    destroyEntry(selected, tasks) {
      const items = !isEmpty(selected) ? selected : tasks;
      const ids = map(items, "id");
      this.showNotif(
        "warning",
        size(ids) > 1 ? "Удалить записи?" : "Удалить запись?",
        "center",
        [
          {
            label: "Отмена",
            color: "white",
            handler: () => {
              this.cargoTableReactiveProperties.selected = [];
            },
          },
          {
            label: "Удалить",
            color: "white",
            handler: async () => {
              const { getUrl } = await import("src/tools/url");
              this.$axios
                .post(getUrl("deleteTasks"), { ids })
                .then(() => {
                  this.cargoTableReactiveProperties.selected = [];
                  tasksStore.deleteTasks(ids);
                  this.$q.loading.hide();
                  this.showNotif(
                    "success",
                    `${
                      size(ids > 1)
                        ? "Записи успешно удалены"
                        : "Запись успешно удалена"
                    }`,
                    "center",
                  );
                })
                .catch((error) => {
                  console.error("Ошибка", error);
                  this.$q.loading.hide();
                });
            },
          },
        ],
      );
    },
    viewEditDialog(val, event) {
      if (!includes(get(event, "target.classList"), "select_checkbox")) {
        this.entryData = val;
        this.cargoTableReactiveProperties.selected = [];
        setTimeout(() => {
          val.selected = !val.selected;
        }, 100);
        this.showDialogAddTask = true;
      }
    },
  },
};
</script>
