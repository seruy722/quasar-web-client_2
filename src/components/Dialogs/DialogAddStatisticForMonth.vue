<template>
  <DialogComponent
    v-model:dialog="show"
    title="Код"
    :persistent="true"
    data-vue-component-name="DialogAddStatisticForMonth"
  >
    <Card style="min-width: 320px; width: 100%; max-width: 600px">
      <CardSection class="row justify-between bg-grey q-mb-sm">
        <span class="text-h6">{{ title }}</span>
        <div>
          <IconBtn
            dense
            icon="clear"
            tooltip="Закрыть"
            @icon-btn-click="close(codePriceData)"
          />
        </div>
      </CardSection>

      <CardSection>
        <div class="row justify-between">
          <SearchSelect
            v-model="codePriceData.category_id.value"
            v-model:change-value="codePriceData.category_id.changeValue"
            :label="codePriceData.category_id.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="codePriceData.category_id.field"
            :options="categories"
            :errors="errorsData"
          />
          <BaseInput
            v-model="codePriceData.for_kg.value"
            v-model:change-value="codePriceData.for_kg.changeValue"
            type="number"
            :label="codePriceData.for_kg.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="codePriceData.for_kg.field"
            :errors="errorsData"
          />
          <BaseInput
            v-model="codePriceData.for_place.value"
            v-model:change-value="codePriceData.for_place.changeValue"
            type="number"
            :label="codePriceData.for_place.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="codePriceData.for_place.field"
            :errors="errorsData"
          />
          <BaseInput
            v-model="codePriceData.commission.value"
            v-model:change-value="codePriceData.commission.changeValue"
            type="number"
            :label="codePriceData.commission.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="codePriceData.commission.field"
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
          @click-base-btn="close(codePriceData)"
        />

        <BaseBtn
          label="Сохранить"
          color="positive"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="checkErrors(codePriceData, saveData)"
        />
      </CardActions>
    </Card>
  </DialogComponent>
</template>

<script>
import { getUrl } from "src/tools/url";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import showNotif from "src/mixins/showNotif";
import {
  setDefaultData,
  getCategories,
} from "src/utils/FrequentlyCalledFunctions";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import BaseBtn from "src/components/Buttons/BaseBtn.vue";
import BaseInput from "src/components/Elements/BaseInput.vue";
import Separator from "src/components/Separator.vue";
import Card from "src/components/Elements/Card/Card.vue";
import CardActions from "src/components/Elements/Card/CardActions.vue";
import CardSection from "src/components/Elements/Card/CardSection.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import { get, reduce, isEmpty, forEach, set } from "lodash";
import { useCategoryStore } from "stores/category";
const categoryStore = useCategoryStore();
import { useCodesPriceStore } from "stores/codes-prices";
const codesPriceStore = useCodesPriceStore();

export default {
  name: "DialogAddStatisticForMonth",
  components: {
    DialogComponent,
    BaseBtn,
    BaseInput,
    Separator,
    Card,
    CardActions,
    CardSection,
    IconBtn,
    SearchSelect,
  },
  mixins: [showNotif, CheckErrorsMixin],
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    codeId: {
      type: Number,
      default: 0,
    },
    entryData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      show: false,
      codePriceData: {
        category_id: {
          type: "number",
          label: "Категория",
          field: "category_id",
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          default: null,
          value: null,
        },
        for_kg: {
          type: "number",
          label: "За кг",
          field: "for_kg",
          changeValue: false,
          default: 0,
          value: 0,
        },
        for_place: {
          type: "number",
          label: "За кг",
          field: "for_place",
          changeValue: false,
          default: 0,
          value: 0,
        },
        commission: {
          type: "number",
          label: "Комиссия",
          field: "commission",
          changeValue: false,
          default: 0,
          value: 0,
        },
      },
    };
  },
  computed: {
    categories() {
      return categoryStore.getCategories;
    },
    title() {
      return isEmpty(this.entryData) ? "Добавление" : "Редактирование";
    },
  },
  watch: {
    showDialog(val) {
      if (val) {
        this.$q.loading.show();
        Promise.all([getCategories(categoryStore)]).then(() => {
          this.show = val;
          this.$q.loading.hide();
        });
      }
    },
    show(val) {
      this.$emit("update:showDialog", val);
    },
    entryData(val) {
      if (!isEmpty(val)) {
        forEach(this.codePriceData, (item, index) => {
          if (get(this.entryData, index)) {
            set(item, "value", get(this.entryData, index));
          }
        });
        this.codePriceData.category_id.require = false;
      }
    },
  },
  methods: {
    saveData(values) {
      const sendData = reduce(
        values,
        (result, item) => {
          if (item.changeValue) {
            result[item.field] = item.value;
          }
          return result;
        },
        {},
      );

      if (!isEmpty(sendData)) {
        sendData.code_id = this.codeId;
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
                this.close(this.codePriceData);
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
            .post(getUrl("addCodePrice"), sendData)
            .then(({ data: { codePrice } }) => {
              codesPriceStore.addNewCodePrice(codePrice);
              this.close(this.codePriceData);
              this.$q.loading.hide();
              this.showNotif(
                "success",
                `Категория <<${codePrice.category_name}>> успешно добавлена клиенту - ${codePrice.code_client_name}`,
                "center",
              );
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
        }
      }
    },
    close(data) {
      this.show = false;
      setDefaultData(data);
      this.$emit("update:codeId", 0);
      this.$emit("update:entryData", {});
    },
  },
};
</script>
