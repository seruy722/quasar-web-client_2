<template>
  <DialogComponent
    v-model:dialog="show"
    title="Fax"
    :persistent="true"
    data-vue-component-name="DialogAddFax"
  >
    <Card style="min-width: 320px; width: 100%; max-width: 500px">
      <CardSection class="row justify-between bg-grey q-mb-sm">
        <span class="text-h6">{{
          entryData.row ? "Редактирование" : "Новый факс"
        }}</span>
        <div>
          <IconBtn
            v-if="entryData.row"
            dense
            icon="history"
            tooltip="История"
            @icon-btn-click="
              entryData.historyFunc(entryData.row.id, entryData.cols)
            "
          />
          <IconBtn
            dense
            icon="clear"
            tooltip="Закрыть"
            @icon-btn-click="close(faxData)"
          />
        </div>
      </CardSection>
      <CardSection>
        <BaseInput
          v-model.trim="faxData.name.value"
          v-model:change-value="faxData.name.changeValue"
          :label="faxData.name.label"
          :type="faxData.name.type"
          :autofocus="true"
          :field="faxData.name.field"
          :dense="$q.screen.xs || $q.screen.sm"
          :errors="errorsData"
        />

        <SearchSelect
          v-model.number="faxData.transporter_id.value"
          v-model:change-value="faxData.transporter_id.changeValue"
          :label="faxData.transporter_id.label"
          :dense="$q.screen.xs || $q.screen.sm"
          :field="faxData.transporter_id.field"
          :func-load-data="faxData.transporter_id.funcLoadData"
          :options="transporters"
          :errors="errorsData"
        />

        <BaseSelect
          v-model.number="faxData.transport_id.value"
          v-model:change-value="faxData.transport_id.changeValue"
          :label="faxData.transport_id.label"
          :dense="$q.screen.xs || $q.screen.sm"
          :field="faxData.transport_id.field"
          :options="transport"
          :errors="errorsData"
        />

        <BaseSelect
          v-model.number="faxData.status.value"
          v-model:change-value="faxData.status.changeValue"
          :label="faxData.status.label"
          :dense="$q.screen.xs || $q.screen.sm"
          :field="faxData.status.field"
          :options="faxData.status.options"
          :errors="errorsData"
        />

        <BaseInput
          v-model.trim="faxData.departure_date.value"
          v-model:change-value="faxData.departure_date.changeValue"
          :label="faxData.departure_date.label"
          :errors="errorsData"
          :field="faxData.departure_date.field"
          :mask="faxData.departure_date.mask"
          dense
        >
          <template #append>
            <Date
              v-model:value="faxData.departure_date.value"
              v-model:change-value="faxData.departure_date.changeValue"
            />
          </template>
        </BaseInput>

        <BaseInput
          v-model.trim="faxData.arrival_date.value"
          v-model:change-value="faxData.arrival_date.changeValue"
          :label="faxData.arrival_date.label"
          :errors="errorsData"
          :field="faxData.arrival_date.field"
          :mask="faxData.arrival_date.mask"
          dense
        >
          <template #append>
            <Date
              v-model:value="faxData.arrival_date.value"
              v-model:change-value="faxData.arrival_date.changeValue"
            />
          </template>
        </BaseInput>

        <BaseInput
          v-model.trim="faxData.notation.value"
          v-model:change-value="faxData.notation.changeValue"
          :label="faxData.notation.label"
          :type="faxData.notation.type"
          :field="faxData.notation.field"
          :dense="$q.screen.xs || $q.screen.sm"
          :errors="errorsData"
        />
      </CardSection>

      <Separator />
      <CardActions>
        <OutlineBtn
          label="Закрыть"
          color="negative"
          @click-outline-btn="close(faxData)"
        />

        <OutlineBtn
          label="Сохранить"
          color="positive"
          @click-outline-btn="checkErrors(faxData, saveFax)"
        />
      </CardActions>
    </Card>
  </DialogComponent>
</template>

<script>
import { getUrl } from "src/tools/url";
import showNotif from "src/mixins/showNotif";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import getFromSettings from "src/tools/settings";
import {
  setDefaultData,
  getTransports,
  getTransporters,
  setFormatedDate,
  setChangeValue,
} from "src/utils/FrequentlyCalledFunctions";
import { reverseDate, addTime } from "src/utils/formatDate";
import { formatISO } from "date-fns";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import OutlineBtn from "src/components/Buttons/OutlineBtn.vue";
import BaseInput from "src/components/Elements/BaseInput.vue";
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import Card from "src/components/Elements/Card/Card.vue";
import CardActions from "src/components/Elements/Card/CardActions.vue";
import CardSection from "src/components/Elements/Card/CardSection.vue";
import Separator from "src/components/Separator.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import BaseSelect from "src/components/Elements/BaseSelect.vue";
import Date from "src/components/Date.vue";
import { get, reduce, isEmpty, forEach, set, upperFirst } from "lodash";
import { useFaxesStore } from "stores/faxes";
const faxesStore = useFaxesStore();
import { useTransporterStore } from "stores/transporter";
const transporterStore = useTransporterStore();
import { useTransportStore } from "src/stores/transport";
const transportStore = useTransportStore();

export default {
  name: "DialogAddFax",
  components: {
    DialogComponent,
    OutlineBtn,
    BaseInput,
    SearchSelect,
    Card,
    CardActions,
    CardSection,
    Separator,
    IconBtn,
    BaseSelect,
    Date,
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
  emits: ["update:showDialog"],
  data() {
    return {
      value: "",
      show: false,
      faxData: {
        name: {
          type: "text",
          label: "Название",
          field: "name",
          autofocus: true,
          rules: [
            {
              name: "isLength",
              error: "Минимальное количество символов 2.",
              options: {
                min: 2,
                max: 100,
              },
            },
          ],
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          default: "Деберц ",
          value: "Деберц ",
        },
        status: {
          type: "select",
          label: "Статус",
          field: "status",
          options: getFromSettings("transportStatusOptions"),
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          default: 0,
          value: 0,
        },
        transporter_id: {
          type: "number",
          label: "Перевожчик",
          field: "transporter_id",
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          funcLoadData: getTransporters,
          changeValue: false,
          default: null,
          value: null,
        },
        transport_id: {
          type: "number",
          label: "Транспорт",
          field: "transport_id",
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          default: null,
          value: null,
        },
        departure_date: {
          type: "date",
          label: "Дата отправления",
          field: "departure_date",
          require: false,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          mask: "##-##-#### ##:##:##",
          default: "",
          value: "",
        },
        arrival_date: {
          type: "date",
          label: "Дата прибытия",
          field: "arrival_date",
          require: false,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          mask: "##-##-#### ##:##:##",
          default: "",
          value: "",
        },
        notation: {
          type: "text",
          label: "Примечания",
          field: "notation",
          rules: [
            {
              name: "isLength",
              error: "Максимальное количество символов 255.",
              options: {
                min: undefined,
                max: 255,
              },
            },
          ],
          changeValue: false,
          default: "",
          value: "",
        },
      },
    };
  },
  computed: {
    transporters() {
      return transporterStore.getTransporters;
    },
    transport() {
      return transportStore.getTransports;
    },
  },
  watch: {
    showDialog(val) {
      if (val) {
        this.$q.loading.show();
        Promise.all([
          getTransports(transportStore),
          getTransporters(transporterStore),
        ]).then(() => {
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
        forEach(this.faxData, (item, index) => {
          if (get(this.entryData, `row[${index}]`)) {
            set(item, "value", get(this.entryData, `row[${index}]`));
          }
        });
      }
    },
    "faxData.status.value": function view(val) {
      switch (val) {
        case 1:
          this.faxData.departure_date.value = "";
          this.faxData.arrival_date.value = "";
          // this.faxData.departure_date.changeValue = true;
          // this.faxData.arrival_date.changeValue = true;
          this.faxData.departure_date.require = false;
          this.faxData.arrival_date.require = false;
          break;
        case 2:
          this.faxData.departure_date.require = true;
          this.faxData.arrival_date.require = false;
          this.faxData.arrival_date.value = "";
          // this.faxData.arrival_date.changeValue = true;
          break;
        case 3:
          this.faxData.arrival_date.require = true;
          this.faxData.departure_date.require = true;
          break;
        case 4:
          this.faxData.arrival_date.require = false;
          this.faxData.departure_date.require = true;
          this.faxData.arrival_date.value = "";
          // this.faxData.arrival_date.changeValue = true;
          break;
        default:
          this.faxData.departure_date.require = false;
          this.faxData.departure_date.require = false;
      }
    },
  },
  methods: {
    saveFax(faxData) {
      const sendData = reduce(
        faxData,
        (result, { value, changeValue }, index) => {
          if (changeValue) {
            if (index === "name") {
              result[index] = upperFirst(value);
            } else if (index === "departure_date" && value) {
              if (value) {
                const date = reverseDate(value);
                result[index] = formatISO(addTime(date));
              } else {
                result[index] = null;
              }
            } else if (index === "arrival_date" && value) {
              if (value) {
                const date = reverseDate(value);
                result[index] = formatISO(addTime(date));
              } else {
                result[index] = null;
              }
            } else {
              result[index] = value;
            }
          }
          return result;
        },
        {},
      );
      if (!isEmpty(sendData)) {
        this.$q.loading.show();
        if (this.entryData.row) {
          sendData.id = get(this.entryData, "row.id");
          this.$axios
            .post(getUrl("updateFaxes"), sendData)
            .then(({ data: { fax } }) => {
              this.$q.loading.hide();
              faxesStore.updateFax(
                setFormatedDate(fax, ["departure_date", "arrival_date"]),
              );
              setChangeValue(this.faxData);
              this.close(this.faxData);
              this.showNotif("success", "Факс успешно обновлен.", "center");
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
          this.$axios
            .post(getUrl("addFax"), sendData)
            .then(({ data: { fax } }) => {
              this.$q.loading.hide();
              faxesStore.addFax(
                setFormatedDate(fax, ["departure_date", "arrival_date"]),
              );
              this.close(this.faxData);
              this.showNotif("success", "Факс успешно добавлен.", "center");
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
      } else {
        this.close(this.faxData);
      }
    },
    close(data) {
      this.show = false;
      setDefaultData(data);
      set(this.entryData, "selected", false);
    },
  },
};
</script>
