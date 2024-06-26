<template>
  <DialogComponent
    v-model:dialog="show"
    title="Клиент"
    :persistent="true"
    data-vue-component-name="DialogAddTask"
  >
    <q-card style="min-width: 320px; width: 100%; max-width: 500px">
      <q-card-section class="row justify-between bg-grey q-mb-sm">
        <span class="text-h6">{{ dialogTitle }}</span>
        <div>
          <IconBtn
            dense
            icon="clear"
            tooltip="Закрыть"
            @icon-btn-click="close(tasksData)"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <div v-for="(item, index) in tasksData" :key="index">
          <SearchSelect
            v-if="item.type === 'searchSelect'"
            v-model.number="item.value"
            v-model:change-value="item.changeValue"
            :label="item.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="item.field"
            :options="item.options"
            :func-load-data="item.funcLoadData"
            :errors="errorsData"
          />

          <BaseInput
            v-else
            v-model="item.value"
            v-model:change-value="item.changeValue"
            :label="item.label"
            :dense="$q.screen.xs || $q.screen.sm"
            :field="item.field"
            :mask="item.mask"
            :unmasked-value="item.unmaskedValue"
            :autofocus="item.autofocus"
            :errors="errorsData"
          />
        </div>
      </q-card-section>
      <Separator />
      <q-card-actions align="right">
        <BaseBtn
          label="Отмена"
          color="negative"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="close(tasksData)"
        />

        <BaseBtn
          label="Сохранить"
          color="positive"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="checkErrors(tasksData, saveData)"
        />
      </q-card-actions>
    </q-card>
  </DialogComponent>
</template>

<script>
import { getUrl } from "src/tools/url";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import showNotif from "src/mixins/showNotif";
import {
  setDefaultData,
  setChangeValue,
} from "src/utils/FrequentlyCalledFunctions";
import getFromSettings from "src/tools/settings";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import BaseInput from "src/components/Elements/BaseInput.vue";
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import Separator from "src/components/Separator.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import BaseBtn from "src/components/Buttons/BaseBtn.vue";
import { isEmpty, get, set, reduce, startCase } from "lodash";
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();
import { useTasksStore } from "stores/tasks";
const tasksStore = useTasksStore();

export default {
  name: "DialogAddTask",
  components: {
    DialogComponent,
    BaseInput,
    SearchSelect,
    Separator,
    IconBtn,
    BaseBtn,
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
      tasksData: {
        description: {
          type: "text",
          label: "Описание",
          field: "description",
          require: true,
          requireError: "Поле обьзательное для заполнения.",
          changeValue: false,
          autofocus: true,
          default: null,
          value: null,
        },
        section_id: {
          type: "searchSelect",
          label: "Раздел",
          field: "section_id",
          options: getFromSettings("sectionTask"),
          changeValue: false,
          default: null,
          value: null,
        },
        responsible_id: {
          type: "searchSelect",
          label: "Ответственный",
          field: "responsible_id",
          options: [],
          changeValue: false,
          default: null,
          value: null,
        },
        status_id: {
          type: "searchSelect",
          label: "Статус",
          field: "status_id",
          options: getFromSettings("statusTask"),
          changeValue: false,
          default: 1,
          value: 1,
        },
      },
    };
  },
  computed: {
    dialogTitle() {
      return isEmpty(this.entryData) ? "Новая задача" : "Редактирование задачи";
    },
    usersList() {
      return authStore.getUsersList;
    },
  },
  watch: {
    entryData(val) {
      if (!isEmpty(val)) {
        forEach(this.tasksData, (item, index) => {
          if (get(this.entryData, `row[${index}]`)) {
            set(item, "value", get(this.entryData, `row[${index}]`));
          }
        });
      }
    },
    showDialog(val) {
      this.show = val;
    },
    show(val) {
      this.$emit("update:showDialog", val);
    },
    usersList(val) {
      if (!isEmpty(val)) {
        this.tasksData.responsible_id.options = val;
      }
    },
  },
  created() {
    if (isEmpty(this.usersList)) {
      authStore.fetchUsersList();
    }
    this.tasksData.responsible_id.options = this.usersList;
  },
  methods: {
    saveData(values) {
      const createData = reduce(
        values,
        (result, { value }, index) => {
          result[index] = value;
          return result;
        },
        {},
      );
      if (isEmpty(this.entryData)) {
        // ДОБАВЛЕНИЕ ЗАПИСИ
        this.$q.loading.show();
        this.$axios
          .post(getUrl("storeTask"), createData)
          .then(({ data: { task } }) => {
            this.$q.loading.hide();
            tasksStore.addOrUpdateTask(task);
            this.close(this.tasksData);
            this.showNotif("success", "Клиент успешно добавлен.", "center");
          })
          .catch((errors) => {
            this.errorsData.errors = get(errors, "response.data.errors");
            this.$q.loading.hide();
          });
      } else {
        // ОБНОВЛЕНИЕ ЗАПИСИ
        const updateData = reduce(
          values,
          (result, { value, changeValue }, index) => {
            if (changeValue) {
              if (index === "name") {
                result[index] = startCase(value);
              } else {
                result[index] = value;
              }
            }
            return result;
          },
          {},
        );
        if (!isEmpty(updateData)) {
          updateData.id = this.entryData.row.id;

          this.$q.loading.show();
          this.$axios
            .post(getUrl("updateTask"), updateData)
            .then(({ data: { task } }) => {
              this.$q.loading.hide();
              tasksStore.addOrUpdateTask(task);
              setChangeValue(values);
              this.close(this.tasksData);
              this.showNotif(
                "success",
                "Данные клиента успешно обновлены.",
                "center",
              );
            })
            .catch((errors) => {
              this.errorsData.errors = get(errors, "response.data.errors");
              this.$q.loading.hide();
            });
        } else {
          this.showNotif("info", "Нет измененных данных", "center");
        }
      }
    },
    close(data) {
      this.show = false;
      setDefaultData(data);
      setChangeValue(data);
      set(this.entryData, "selected", false);
      this.$emit("update:entryData", {});
    },
  },
};
</script>
