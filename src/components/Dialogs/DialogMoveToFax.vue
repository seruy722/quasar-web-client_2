<template>
  <DialogComponent
    :dialog="show"
    title="Факсы"
    :persistent="true"
    data-vue-component-name="DialogMoveToFax"
  >
    <q-card style="min-width: 320px; width: 100%; max-width: 500px">
      <q-card-section class="row justify-between bg-grey q-mb-sm">
        <span class="text-h6">Перемещение в факс</span>
        <div>
          <IconBtn
            dense
            icon="clear"
            tooltip="Закрыть"
            @icon-btn-click="close"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <SearchSelect
          v-model="faxData.faxId.value"
          :label="faxData.faxId.label"
          :field="faxData.faxId.field"
          :dense="$q.screen.xs || $q.screen.sm"
          :options="allFaxes"
          :errors="errorsData"
        />
      </q-card-section>

      <Separator />

      <q-card-section>
        <BaseBtn
          label="Отмена"
          color="negative"
          :dense="$q.screen.xs || $q.screen.sm"
          class="q-mr-md"
          @click-base-btn="close"
        />

        <BaseBtn
          label="Сохранить"
          color="positive"
          :dense="$q.screen.xs || $q.screen.sm"
          @click-base-btn="checkErrors(faxData, saveData)"
        />
      </q-card-section>
    </q-card>
  </DialogComponent>
</template>

<script>
import { getUrl } from "src/tools/url";
import CheckErrorsMixin from "src/mixins/CheckErrors";
import showNotif from "src/mixins/showNotif";
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import BaseBtn from "src/components/Buttons/BaseBtn.vue";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import Separator from "src/components/Separator.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import { get, isEmpty, forEach, has, map, filter, size, first } from "lodash";
import { useFaxesStore } from "stores/faxes";
import { useStorehouseStore } from "stores/storehouse";
const faxesStore = useFaxesStore();
const storehouseStore = useStorehouseStore();
export default {
  name: "DialogMoveToFax",
  components: {
    SearchSelect,
    BaseBtn,
    DialogComponent,
    Separator,
    IconBtn,
  },
  mixins: [showNotif, CheckErrorsMixin],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    values: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:show", "update:values"],
  data() {
    return {
      faxId: null,
      allFaxes: [],
      faxData: {
        faxId: {
          label: "Факсы",
          field: "faxId",
          require: true,
          requireError: "Выберите значение.",
          default: null,
          value: null,
        },
      },
    };
  },
  computed: {
    faxes() {
      return faxesStore.getFaxes;
    },
  },
  watch: {
    faxes(val) {
      if (!isEmpty(val)) {
        this.setAllFaxes(val);
      } else {
        this.$emit("update:show", false);
        this.showNotif(
          "warning",
          "Список факсов пуст! Добавте факс.",
          "center",
        );
      }
      // if (!isEmpty(val)) {
      //     this.allFaxes = map(filter(val, { uploaded_to_cargo: 0 }), ({ name, id }) => ({
      //         label: name,
      //         value: id,
      //     }));
      // }
    },
    show(val) {
      if (val) {
        this.$q.loading.show();
        Promise.all([faxesStore.fetchFaxes()]).finally(() => {
          this.$q.loading.hide();
        });
      }
    },
  },
  created() {
    if (!isEmpty(this.faxes)) {
      this.setAllFaxes(this.faxes);
    }
  },
  methods: {
    setAllFaxes(faxes) {
      this.allFaxes = map(
        filter(faxes, { uploaded_to_cargo: 0 }),
        ({ name, id }) => ({
          label: name,
          value: id,
        }),
      );
    },
    saveData({ faxId: { value } }) {
      this.$q.loading.show();
      let ids = [];
      if (has(first(this.values), "arr")) {
        forEach(this.values, ({ arr }) => {
          forEach(arr, ({ id }) => {
            ids.push(id);
          });
        });
      } else {
        ids = map(this.values, "id");
      }
      this.$axios
        .post(getUrl("moveFromStorehouseToFax"), {
          ids,
          faxId: value,
        })
        .then(() => {
          if (get(first(this.values), "fax_id") > 0) {
            faxesStore.deleteEntryFromFaxData(ids);
          } else {
            storehouseStore.destroyStorehouseData(ids);
          }
          this.$q.loading.hide();
          this.close();
          this.showNotif(
            "success",
            size(ids) > 1
              ? "Записи успешно перемещены."
              : "Запись успешно перемещена.",
            "center",
          );
        })
        .catch((errors) => {
          this.$q.loading.hide();
          console.error("Ошибка запроса moveFromStorehouseToFax ", errors);
        });
    },
    close() {
      this.$emit("update:show", false);
      this.$emit("update:values", []);
      this.faxData.faxId.value = null;
    },
  },
};
</script>
