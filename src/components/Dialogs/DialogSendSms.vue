<template>
  <q-dialog
    v-model="dialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    data-vue-component-name="DialogSendSms"
  >
    <q-card>
      <q-bar>
        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          :disable="!maximizedToggle"
          @click="maximizedToggle = false"
        >
          <q-tooltip
            v-if="maximizedToggle"
            content-class="bg-white text-primary"
          >
            Minimize
          </q-tooltip>
        </q-btn>
        <q-btn
          dense
          flat
          icon="crop_square"
          :disable="maximizedToggle"
          @click="maximizedToggle = true"
        >
          <q-tooltip
            v-if="!maximizedToggle"
            content-class="bg-white text-primary"
          >
            Maximize
          </q-tooltip>
        </q-btn>
        <q-btn v-close-popup dense flat icon="close">
          <q-tooltip content-class="bg-white text-primary"> Close </q-tooltip>
        </q-btn>
      </q-bar>

      <div>
        Тариф: {{ rate }} | Баланс :
        <q-badge :color="balance > 0 ? 'positive' : 'negative'">
          {{ balance }}
        </q-badge>
        | Остаток сообщений: {{ Math.round(balance / rate) }}
      </div>

      <q-card-section>
        <TableComponent
          :table-properties="faxTableProperties"
          :table-data="faxTableData"
          :table-reactive-properties="faxTableReactiveProperties"
          :title="fax.name"
        >
          <template #inner-body="{ props }">
            <q-tr
              :props="props"
              :class="{ table__tr_bold_text: props.row.brand }"
            >
              <q-td auto-width>
                <q-checkbox v-model="props.selected" dense />
              </q-td>

              <q-td key="code_client_name" :props="props">
                {{ props.row.code_client_name }}
              </q-td>

              <q-td key="place" :props="props">
                {{ props.row.place }}
              </q-td>

              <q-td key="kg" :props="props">
                {{ numberFormat(props.row.kg) }}
              </q-td>

              <q-td key="for_kg" class="text-bold text-red" :props="props">
                {{ numberFormat(props.row.for_kg) }}
              </q-td>

              <q-td key="for_place" class="text-bold text-red" :props="props">
                {{ numberFormat(props.row.for_place) }}
              </q-td>

              <q-td key="sum" class="text-bold" :props="props">
                {{ props.row.sum }}
              </q-td>

              <q-td key="category_name" :props="props">
                {{ props.row.category_name }}
              </q-td>

              <q-td key="text" :props="props">
                <q-input
                  v-model="props.row.text"
                  :maxlength="maxLength"
                  counter
                  dense
                />
              </q-td>

              <q-td key="status" :props="props">
                <q-badge
                  v-show="props.row.status"
                  :color="props.row.status === 'OK' ? 'positive' : 'negative'"
                >
                  {{ props.row.status }}
                </q-badge>
              </q-td>

              <q-td key="phones" :props="props">
                <q-input
                  v-if="!Array.isArray(props.row.selectedPhones)"
                  v-model="props.row.selectedPhones"
                  type="tel"
                  lazy-rules
                  mask="+38 (###)-###-##-##"
                  filled
                  label="Номер телефона"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || 'Введите номер телефона',
                    (val) =>
                      (val && val.length === 19) ||
                      'Некоректный номер телефона',
                  ]"
                />
                <q-option-group
                  v-if="Array.isArray(props.row.selectedPhones)"
                  v-model="props.row.selectedPhones"
                  :options="props.row.phones"
                  color="green"
                  type="checkbox"
                />
              </q-td>
            </q-tr>
          </template>
        </TableComponent>
      </q-card-section>
      <q-card-section v-if="faxTableData.length">
        <q-btn-group outline spread>
          <q-btn
            v-for="(item, index) in options"
            :key="index"
            outline
            :color="item.color"
            :label="item.label"
            @click="addText(item.value)"
          />
        </q-btn-group>
        <q-input
          v-model="text"
          filled
          counter
          label="Сообщение"
          type="textarea"
          :maxlength="maxLength"
          :hint="`Максимальное количество символов ${maxLength}`"
        />
      </q-card-section>

      <q-card-actions v-if="faxTableData.length" align="right">
        <q-btn
          :disable="!text"
          label="Просмотр"
          color="primary"
          @click="viewSms(text, faxTableData, sendSmsDialogData, options)"
        />

        <q-btn
          :disable="!text"
          label="Отправить"
          color="positive"
          @click="
            confirmDialog('Отправки сообщений', 'Отправить сообщение клиентам?')
          "
        />
      </q-card-actions>
      <q-card-section>
        <q-btn label="Отчет" color="primary" @click="getArchiveSms(fax.id)" />
      </q-card-section>
      <q-card-section>
        <q-list bordered separator class="rounded-borders">
          <q-item>
            <q-item-section>
              <q-item-label>Дата отправки</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>Количество смс</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>Отправитель</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item v-for="(item, index) in archive" :key="index">
            <template #header>
              <q-item-section>
                {{ fullDate(item[0].created_at) }}
              </q-item-section>

              <q-item-section>
                {{ item.length }}
              </q-item-section>
              <q-item-section>
                {{ item[0].user_name }}
              </q-item-section>
            </template>

            <q-card>
              <q-card-section>
                <q-list bordered separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Клиент</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Телефон</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>СМС</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Статус</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-for="(elem, i) in item" :key="i">
                    <q-item-section>
                      <q-item-label>{{
                        elem.result.req.clientData.code_client_name
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{
                        elem.result.req.recipients[0]
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{
                        elem.result.req.sms
                          ? elem.result.req.sms.text
                          : elem.result.req.text
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{
                          elem.result.res.success
                            ? "Отправлено"
                            : "Не отправлено"
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { getUrl } from "src/tools/url";
import { fullDate } from "src/utils/formatDate";
import { thingsFilter, numberFormat } from "src/utils";
import TableComponent from "src/components/Elements/Table/Table.vue";
import showNotif from "src/mixins/showNotif";
import { uid } from "quasar";
import {
  get,
  isEmpty,
  forEach,
  set,
  clone,
  cloneDeep,
  map,
  size,
  first,
  isArray,
  toString,
  find,
  includes,
  round,
  uniq,
  uniqBy,
} from "lodash";
import { useCodesStore } from "stores/codes";
const codesStore = useCodesStore();

export default {
  name: "DialogSendSms",
  components: {
    TableComponent,
  },
  mixins: [showNotif],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    values: {
      type: Array,
      default: () => [],
    },
    fax: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:show"],
  data() {
    return {
      status: false,
      archive: {},
      maxLength: 70,
      rate: 0.66,
      balance: null,
      group: [],
      options: [
        {
          label: "Мест",
          value: "{place}",
          field: "place",
          text: "мест",
        },
        {
          label: "Вес",
          value: "{kg}",
          field: "kg",
          // color: 'green',
          text: "вес",
        },
        {
          label: "Сумма",
          value: "{sum}",
          field: "sum",
          // color: 'red',
          text: "",
        },
        {
          label: "Категория",
          value: "{category_name}",
          field: "category_name",
          // color: 'red',
          text: "",
        },
      ],
      sendSmsDialogData: [],
      text: "",
      maximizedToggle: true,
      faxTableData: [],
      faxTableProperties: {
        columns: [
          {
            name: "code_client_name",
            label: "Клиент",
            align: "center",
            field: "code_client_name",
            sortable: true,
          },
          {
            name: "place",
            label: "Мест",
            field: "place",
            align: "center",
            sortable: true,
          },
          {
            name: "kg",
            label: "Вес",
            field: "kg",
            align: "center",
            sortable: true,
          },
          {
            name: "for_kg",
            label: "За кг",
            field: "for_kg",
            align: "center",
            sortable: true,
          },
          {
            name: "for_place",
            label: "За место",
            field: "for_place",
            align: "center",
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
            name: "category_name",
            label: "Категория",
            field: "category_name",
            align: "center",
            sortable: true,
          },
          {
            name: "text",
            label: "Сообщение",
            field: "sms",
            align: "center",
          },
          {
            name: "status",
            label: "Статус",
            field: "status",
            align: "center",
          },
          {
            name: "phones",
            label: "Телефоны",
            field: "phones",
            align: "center",
          },
        ],
      },
      faxTableReactiveProperties: {
        selected: [],
        visibleColumns: [
          "code_client_name",
          "place",
          "kg",
          "for_kg",
          "for_place",
          "category_name",
          "sum",
          "text",
          "status",
          "phones",
        ],
        title: "",
      },
    };
  },
  computed: {
    dialog: {
      set: function set(val) {
        this.$emit("update:show", val);
      },
      get: function get() {
        return this.show;
      },
    },
    clientCodes() {
      return codesStore.getCodes;
    },
  },
  watch: {
    show(val) {
      if (val && isEmpty(this.sendSmsDialogData)) {
        this.getCustomersPhones(
          this.values,
          this.faxTableReactiveProperties.selected,
        );
        this.getBalance();
      }
    },
  },
  methods: {
    fullDate,
    getArchiveSms(id) {
      this.$axios
        .get(`${getUrl("getArchiveSms")}/${id}`)
        .then(({ data: { archives } }) => {
          forEach(archives, (item) => {
            forEach(item, (elem) => {
              elem.result = JSON.parse(elem.result);
            });
          });
          this.archive = archives;
        });
    },
    addText(value) {
      const textLength = this.text.length;
      const valueLength = value.length;
      if (valueLength + textLength <= this.maxLength) {
        this.text = `${this.text}${value}`;
      }
    },
    async getBalance() {
      return await this.$axios
        .get(getUrl("getSmsBalance"))
        .then(({ data: { balance } }) => {
          this.balance = balance;
          return balance;
        });
    },
    thingsFilter,
    numberFormat,
    sendSms(values) {
      const sendData = [];

      forEach(values, (item) => {
        if (!isEmpty(item.selectedPhones)) {
          sendData.push({
            recipients: isArray(item.selectedPhones)
              ? item.selectedPhones
              : toString(
                  parseInt(item.selectedPhones.replace(/[^\d]/g, ""), 10),
                ),
            clientData: item,
            text: item.text,
          });
        }
      });

      this.getBalance().then((balance) => {
        if (
          balance >
          sum(map(sendData, (elem) => size(elem.recipients))) * this.rate
        ) {
          this.$axios
            .post(getUrl("sendSms"), {
              sendData,
              faxId: this.fax.id,
              uid: uid(),
            })
            .then(({ data }) => {
              this.text = "";
              forEach(this.faxTableData, (elem) => {
                elem.text = "";
              });
              this.getBalance();
              forEach(data.response_result, (elem) => {
                const find = find(this.faxTableData, (item) =>
                  includes(item.selectedPhones, first(elem.req.recipients)),
                );
                if (find) {
                  find.status = elem.res.response_status;
                }
              });
              this.showNotif(
                "success",
                "Сообщения успешно отправлены!",
                "center",
              );
            });
        } else {
          this.showNotif("info", "Недостаточно средств", "center");
        }
      });
    },
    confirmDialog(title, message) {
      this.$q
        .dialog({
          title,
          message,
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.viewSms(
            this.text,
            this.faxTableData,
            this.sendSmsDialogData,
            this.options,
          );
          this.sendSms(
            this.faxTableReactiveProperties.selected.length
              ? this.faxTableReactiveProperties.selected
              : this.faxTableData,
          );
        })
        .onCancel(() => {})
        .onDismiss(() => {});
    },
    sum(data) {
      return round(
        get(data, "for_kg") * get(data, "kg") +
          get(data, "for_place") * get(data, "place"),
      );
    },
    getCustomersPhones(allData, selected) {
      const list = isEmpty(selected) ? allData : selected;
      const codeIds = uniq(map(list, "code_client_id"));
      this.$axios
        .post(getUrl("codesIds"), { ids: codeIds })
        .then(({ data: { codesData } }) => {
          this.sendSmsDialogData = codesData;
          this.faxTableData = cloneDeep(this.values);
          this.setSmsObj(this.faxTableData, codesData);
        });
    },
    viewSms(text, data, phonesData, options) {
      const cloneData = cloneDeep(data);
      forEach(cloneData, (item) => {
        let cloneText = clone(text);
        forEach(options, (elem) => {
          cloneText = cloneText.replaceAll(elem.value, item[elem.field]);
        });

        set(item, "text", cloneText);
      });
      this.faxTableData = cloneData;
    },
    setSmsObj(data, phonesData) {
      const cloneData = cloneDeep(data);
      forEach(cloneData, (item) => {
        const findPhonesData = find(phonesData, { id: item.code_client_id });
        item.sum = this.sum(item);
        item.text = "";
        const phones = uniqBy(
          map(get(findPhonesData, "customers") || [], ({ phone }) => ({
            label: phone,
            value: phone,
          })),
          "label",
        );
        item.phones = phones;
        item.selectedPhones = !isEmpty(phones)
          ? [get(first(phones), "value")]
          : "";
        item.status = "";
      });
      this.faxTableData = cloneData;
    },
  },
};
</script>
