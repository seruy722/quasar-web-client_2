<template>
  <DialogComponent
    v-model:dialog="show"
    title="Код"
    :persistent="true"
    data-vue-component-name="DialogAddExpense"
  >
    <Card style="min-width: 320px; width: 100%; max-width: 600px">
      <CardSection class="row justify-between bg-grey q-mb-sm">
        <span class="text-h6">{{ title }}</span>
        <div>
          <IconBtn
            dense
            icon="clear"
            tooltip="Закрыть"
            @icon-btn-click="close(expenseData)"
          />
        </div>
      </CardSection>

      <CardSection>
        <div class="row justify-between">
          <SelectChips
            v-model="expenseData.expense.value"
            v-model:change-value="expenseData.expense.changeValue"
            :label="expenseData.expense.label"
            :field="expenseData.expense.field"
            :dense="$q.screen.xs || $q.screen.sm"
            :options="expenseData.expense.options"
            :func-load-data="expenseData.expense.funcLoadData"
            :errors="errorsData"
          />
          <BaseInput
            v-model="expenseData.sum.value"
            v-model:change-value="expenseData.sum.changeValue"
            type="number"
            :label="expenseData.sum.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="expenseData.sum.field"
            :errors="errorsData"
          />
          <DateWithInputForCargo
            v-model:value="expenseData.date.value"
            v-model:change-value="expenseData.date.changeValue"
          />
          <BaseInput
            v-model="expenseData.description.value"
            v-model:change-value="expenseData.description.changeValue"
            type="text"
            :label="expenseData.description.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="expenseData.description.field"
            :errors="errorsData"
          />
        </div>
      </CardSection>

      <Separator />

      <CardActions>
        <BaseBtn
          label="Отмена"
          color="negative"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="close(expenseData)"
        />

        <BaseBtn
          label="Сохранить"
          color="positive"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="checkErrors(expenseData, saveData)"
        />
      </CardActions>
    </Card>
  </DialogComponent>
</template>

<script>
import { getUrl } from "src/tools/url";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import showNotif from "src/mixins/showNotif";
import { setDefaultData } from "src/utils/FrequentlyCalledFunctions";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import BaseBtn from "src/components/Buttons/BaseBtn.vue";
import BaseInput from "src/components/Elements/BaseInput.vue";
import Separator from "src/components/Separator.vue";
import Card from "src/components/Elements/Card/Card.vue";
import CardActions from "src/components/Elements/Card/CardActions.vue";
import CardSection from "src/components/Elements/Card/CardSection.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import SelectChips from "src/components/Elements/SelectChips.vue";
import DateWithInputForCargo from "src/components/DateWithInputForCargo.vue";
import { get, reduce, isEmpty, forEach, set, indexOf } from "lodash";
import { useCodesPriceStore } from "stores/codes-prices";
const codesPriceStore = useCodesPriceStore();
import { useStatisticsStore } from "stores/statistics";
const statisticsStore = useStatisticsStore();

export default {
  name: "DialogAddExpense",
  components: {
    DialogComponent,
    BaseBtn,
    BaseInput,
    Separator,
    Card,
    CardActions,
    CardSection,
    IconBtn,
    SelectChips,
    DateWithInputForCargo,
  },
  mixins: [showNotif, CheckErrorsMixin],
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    entryData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:entryData", "update:showDialog"],
  data() {
    return {
      show: false,
      expenseData: {
        expense: {
          type: "chips",
          label: "Статья расходов",
          field: "expense",
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          options: [],
          funcLoadData: this.getExpenses,
          default: null,
          value: null,
        },
        description: {
          type: "text",
          label: "Описание",
          field: "description",
          require: false,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          default: null,
          value: null,
        },
        sum: {
          type: "number",
          label: "Сумма",
          field: "sum",
          changeValue: false,
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          default: 0,
          value: 0,
        },
        date: {
          type: "text",
          label: "Дата",
          field: "date",
          changeValue: false,
          require: false,
          requireError: "Поле обьзательное для заполнения.",
          default: new Date().toISOString().slice(0, 10).split("-").join("-"),
          value: new Date().toISOString().slice(0, 10).split("-").join("-"),
        },
      },
    };
  },
  computed: {
    title() {
      return isEmpty(this.entryData) ? "Добавление расхода" : "Редактирование";
    },
  },
  watch: {
    showDialog(val) {
      this.show = val;
    },
    show(val) {
      this.$emit("update:showDialog", val);
    },
    entryData(val) {
      if (!isEmpty(val)) {
        forEach(this.expenseData, (item, index) => {
          if (get(this.entryData, index)) {
            set(item, "value", get(this.entryData, index));
          }
        });
        this.expenseData.category_id.require = false;
      }
    },
  },
  methods: {
    getExpenses() {
      return this.$axios.get(getUrl("getExpenses")).then(({ data }) => {
        this.expenseData.expense.options = data;
      });
    },
    saveData(values) {
      const sendData = reduce(
        values,
        (result, item) => {
          if (item.changeValue) {
            result[item.field] = item.value;
          }
          if (item.field === "date" && item.changeValue) {
            result[item.field] = new Date(
              item.value.split("-").join(","),
            ).toISOString();
          }
          return result;
        },
        {},
      );

      if (!isEmpty(sendData)) {
        this.$q.loading.show();
        // UPDATE
        if (!isEmpty(this.entryData)) {
          sendData.id = this.entryData.id;
          this.$axios
            .post(getUrl("updateCodePrice"), sendData)
            .then(({ data: { updatedCodePrice, error } }) => {
              if (error) {
                this.$q.loading.hide();
                this.showNotif("error", error, "center");
              } else {
                codesPriceStore.updateCodePrice(updatedCodePrice);
                this.close(this.expenseData);
                this.$q.loading.hide();
                this.showNotif(
                  "success",
                  `Категория <<${this.entryData.category_name}>> успешно обновлена`,
                  "center",
                );
              }
            })
            .catch(
              ({
                response: {
                  data: { errors },
                },
              }) => {
                this.errorsData.errors = errors;
                this.$q.loading.hide();
              },
            );
        } else {
          // CREATE
          this.$axios
            .post(getUrl("addExpense"), sendData)
            .then(({ data: { expenseData, expense } }) => {
              if (
                indexOf(get(this, "expenseData.expense.options"), expense) ===
                -1
              ) {
                this.expenseData.expense.options.push(expense);
              }
              statisticsStore.addStatistic(expenseData);
              this.showNotif("success", "Запись успешно добавлена");
              this.$q.loading.hide();
            })
            .catch(
              ({
                response: {
                  data: { errors },
                },
              }) => {
                this.errorsData.errors = errors;
                this.$q.loading.hide();
                this.showNotif(
                  "error",
                  "Произошла ошибка при добавлении записи",
                );
              },
            );
        }
      }
    },
    close(data) {
      this.show = false;
      setDefaultData(data);
      this.$emit("update:entryData", {});
    },
  },
};
</script>
