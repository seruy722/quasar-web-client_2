<template>
  <q-page data-vue-component-name="FaxComponent">
    <TableComponent
      :table-properties="faxTableProperties"
      :table-data="faxTableData"
      :table-reactive-properties="faxTableReactiveProperties"
      :title="currentFaxItem.name"
      :data-search="dataSearchFax"
      :loading="loading"
    >
      <template #top-buttons>
        <div class="row q-gutter-sm">
          <RoundBtn
            v-show="addToSaveArray.length"
            color="positive"
            icon="save"
            tooltip="Сохранить"
            @round-btn-click="saveDataInCombineTable(addToSaveArray)"
          />

          <RoundBtn
            color="positive"
            icon="explicit"
            tooltip="Excel"
            @round-btn-click="
              exportFaxData(faxTableReactiveProperties.selected)
            "
          />

          <RoundBtn
            color="orange"
            icon="mail"
            tooltip="Почта"
            @round-btn-click="
              exportFaxMailData(faxTableReactiveProperties.selected)
            "
          />

          <RoundBtn
            v-show="!combineTableData && currentFaxItem.status !== 3"
            icon="sync_alt"
            tooltip="Трансфер данных"
            @round-btn-click="openDialogTransferFromStorehouse"
          />

          <MoveToFaxBtn
            v-show="
              faxTableReactiveProperties.selected.length &&
              faxUploadStatus === 0
            "
            @move-to-fax-click="moveToFax"
          />
          <RoundBtn
            v-show="faxTableReactiveProperties.selected.length"
            color="negative"
            icon="delete"
            tooltip="Удалить"
            @round-btn-click="destroyEntry(faxTableReactiveProperties.selected)"
          />

          <RoundBtn
            icon="send"
            color="primary"
            tooltip="Отправить смс"
            @round-btn-click="
              openDialogSendSms(
                faxTableData,
                faxTableReactiveProperties.selected,
              )
            "
          />

          <q-checkbox v-model="combineTableData" label="Обьеденено" dense />
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
            header-class="bg-secondary text-white"
            style="border-radius: 30px; border: 1px solid #26a69a"
            expand-icon-class="text-white"
          >
            <template #header>
              <ItemSection avatar>
                <q-checkbox v-model="props.selected" dense />
              </ItemSection>

              <ItemSection>
                <ItemLabel :lines="2">
                  {{ props.row.code_client_name }}
                </ItemLabel>
              </ItemSection>

              <ItemSection>
                <ItemLabel>
                  {{ props.row.place }}
                </ItemLabel>
              </ItemSection>

              <ItemSection>
                <ItemLabel>
                  {{ props.row.kg }}
                </ItemLabel>
              </ItemSection>

              <ItemSection v-show="!combineTableData">
                <ItemLabel>
                  <q-badge
                    :color="props.row.in_cargo ? 'positive' : 'negative'"
                  >
                    {{ props.row.in_cargo ? "Да" : "Нет" }}
                  </q-badge>
                </ItemLabel>
              </ItemSection>
            </template>

            <List separator dense>
              <ListItem
                v-for="col in props.cols.filter((col) => col.name !== 'desc')"
                :key="col.name"
                @click-list="viewEditDialog(props)"
              >
                <ItemSection>
                  <ItemLabel>{{ `${col.label}:` }}</ItemLabel>
                </ItemSection>
                <ItemSection side>
                  <ItemLabel v-if="col.field === 'things'" :lines="10">
                    {{ thingsFilter(col.value) }}
                  </ItemLabel>
                  <ItemLabel v-else-if="col.field === 'kg'">
                    {{ numberFormat(col.value) }}
                  </ItemLabel>
                  <ItemLabel v-else>
                    {{ col.value }}
                  </ItemLabel>
                </ItemSection>
              </ListItem>
              <ListItem>
                <ItemSection>
                  <BaseBtn
                    label="История"
                    color="info"
                    style="max-width: 100px; margin: 0 auto"
                    @click-base-btn="
                      getStorehouseDataHistory(props.row.id, props.cols)
                    "
                  />
                </ItemSection>
              </ListItem>
            </List>
          </q-expansion-item>
        </div>
      </template>

      <template #inner-body="{ props }">
        <q-tr
          :props="props"
          :class="{
            table__tr_bold_text: isBrendCategory(props.row.category_name),
            'cursor-pointer': !combineTableData,
          }"
          @click.stop="viewEditDialog(props, $event)"
        >
          <q-td auto-width class="select_checkbox">
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td key="code_place" :props="props">
            {{ props.row.code_place }}
          </q-td>

          <q-td key="code_client_name" class="cursor-pointer" :props="props">
            {{ optionsFilter(props.row.code_client_id, clientCodes) }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.code_client_id"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'code_client_id')"
            >
              <template #inner-default="{ scope }">
                <SearchSelect
                  v-model="scope.value"
                  label="Клиент"
                  :dense="$q.screen.xs || $q.screen.sm"
                  :options="clientCodes"
                />
              </template>
            </PopupEdit>
          </q-td>

          <q-td key="place" :props="props">
            {{ props.row.place }}
          </q-td>

          <q-td key="kg" :props="props">
            {{ numberFormat(props.row.kg) }}
          </q-td>

          <q-td
            key="for_kg"
            class="text-bold text-red cursor-pointer"
            :props="props"
          >
            {{ numberFormat(props.row.for_kg) }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.for_kg"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'for_kg')"
            >
              <template #inner-default="{ scope }">
                <q-input
                  v-model.number="scope.value"
                  type="number"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
                <q-checkbox
                  v-model="props.row.replacePrice"
                  label="Заменить"
                  dense
                />
              </template>
            </PopupEdit>
          </q-td>

          <q-td
            key="for_place"
            class="text-bold text-red cursor-pointer"
            :props="props"
          >
            {{ numberFormat(props.row.for_place) }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.for_place"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'for_place')"
            />
          </q-td>

          <q-td key="cube" class="cursor-pointer" :props="props">
            {{ props.row.cube }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.cube"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'cube')"
            >
              <template #inner-default="{ scope }">
                <q-input
                  v-model.number="scope.value"
                  type="number"
                  autofocus
                  dense
                  @keyup.enter="scope.set"
                />
              </template>
            </PopupEdit>
          </q-td>

          <q-td key="category_name" class="cursor-pointer" :props="props">
            {{ optionsFilter(props.row.category_id, categories) }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.category_id"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'category_id')"
            >
              <template #inner-default="{ scope }">
                <SearchSelect
                  v-model="scope.value"
                  label="Категория"
                  :dense="$q.screen.xs || $q.screen.sm"
                  :options="categories"
                />
              </template>
            </PopupEdit>
          </q-td>

          <q-td key="in_cargo" :props="props">
            <q-badge :color="props.row.in_cargo ? 'positive' : 'negative'">
              {{ props.row.in_cargo ? "Да" : "Нет" }}
            </q-badge>
          </q-td>

          <q-td key="shop" :props="props">
            {{ props.row.shop }}
          </q-td>

          <q-td
            key="delivery_method_name"
            class="cursor-pointer"
            :props="props"
          >
            {{
              optionsFilter(props.row.delivery_method_id, deliveryMethodsList)
            }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.delivery_method_id"
              type="number"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'delivery_method_id')"
            >
              <template #inner-default="{ scope }">
                <SearchSelect
                  v-model="scope.value"
                  label="Способ доставки"
                  :dense="$q.screen.xs || $q.screen.sm"
                  :options="deliveryMethodsList"
                />
              </template>
            </PopupEdit>
          </q-td>

          <q-td key="department" :props="props" class="cursor-pointer">
            {{ props.row.department }}
            <PopupEdit
              v-if="combineTableData"
              v-model:value="props.row.department"
              :title="props.row.code_client_name"
              @add-to-save="addToAddSaveArray(props.row, 'department')"
            />
          </q-td>

          <q-td key="notation" :props="props">
            {{ props.row.notation }}
          </q-td>

          <q-td key="things" :props="props">
            {{ thingsFilter(props.row.things) }}
          </q-td>
        </q-tr>
      </template>
    </TableComponent>

    <CountCategories
      :list="faxTableData"
      :fax-id="currentFaxItem.id"
      style="max-width: 600px; margin: 0 auto"
    />
    <DialogFaxData
      v-model:show-dialog="showFaxDataDialog"
      v-model:entry-data="localFaxEditData"
    />
    <DialogComponent
      :dialog="dialogHistory"
      :persistent="true"
      :maximized="true"
    >
      <Card style="max-width: 600px">
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

        <CardSection class="q-pt-none">
          <StorehouseDataHistory
            :storehouse-history-data="storehouseHistoryData"
          />
        </CardSection>
      </Card>
    </DialogComponent>
    <DialogComponent
      :dialog="dialogTransferFromStorehouse"
      :persistent="true"
      :maximized="true"
    >
      <Card>
        <q-bar>
          <q-space />
          <IconBtn
            v-if="isTransfer"
            flat
            dense
            icon="save"
            tooltip="Сохранить"
            color="positive"
            @icon-btn-click="saveTransfersData(faxSideData, storehouseSideData)"
          />
          <IconBtn
            flat
            dense
            icon="close"
            tooltip="Закрыть"
            @icon-btn-click="closeDialogTransferFromStorehouse"
          />
        </q-bar>
        <CardSection>
          <q-splitter v-model="splitterModel">
            <template #before>
              <div class="q-pa-md">
                <div class="text-h6 q-mb-md">Факс</div>
                <!--                <Search v-model="search" />-->
                <CountCategories
                  :list="faxSideData"
                  style="margin-bottom: 20px"
                />
                <q-list bordered separator>
                  <q-item>
                    <q-item-section>Код</q-item-section>
                    <q-item-section>Клиент</q-item-section>
                    <q-item-section>Мест</q-item-section>
                    <q-item-section>Вес</q-item-section>
                    <q-item-section>Категория</q-item-section>
                  </q-item>
                  <q-slide-item
                    v-for="(item, index) in faxSideData"
                    :key="index"
                    @left="onLeft(item)"
                    @action="onAction"
                  >
                    <template #left>
                      <div>На склад</div>
                    </template>

                    <q-item
                      :class="{
                        'text-bold': isBrendCategory(item.category_name),
                      }"
                    >
                      <q-item-section>{{ item.code_place }}</q-item-section>
                      <q-item-section>{{
                        item.code_client_name
                      }}</q-item-section>
                      <q-item-section>{{ item.place }}</q-item-section>
                      <q-item-section>{{ item.kg }}</q-item-section>
                      <q-item-section>
                        {{ item.category_name }}
                      </q-item-section>
                    </q-item>
                  </q-slide-item>
                </q-list>
              </div>
            </template>

            <template #separator>
              <q-avatar
                color="primary"
                text-color="white"
                size="40px"
                icon="drag_indicator"
              />
            </template>

            <template #after>
              <div class="q-pa-md">
                <div class="text-h6 q-mb-md">Склад</div>
                <!--                <Search v-model="searchStorehouseData" />-->
                <CountCategories
                  :list="storehouseSideData"
                  style="margin-bottom: 20px"
                />
                <q-list bordered separator>
                  <q-item>
                    <q-item-section>Код</q-item-section>
                    <q-item-section>Клиент</q-item-section>
                    <q-item-section>Мест</q-item-section>
                    <q-item-section>Вес</q-item-section>
                    <q-item-section>Категория</q-item-section>
                  </q-item>
                  <q-slide-item
                    v-for="(item, index) in storehouseSideData"
                    :key="index"
                    @right="onRight(item)"
                    @action="onAction"
                  >
                    <template #right>
                      <div>В факс</div>
                    </template>

                    <q-item
                      :class="item.category_name === 'Бренд' ? 'text-bold' : ''"
                    >
                      <q-item-section>{{ item.code_place }}</q-item-section>
                      <q-item-section>{{
                        item.code_client_name
                      }}</q-item-section>
                      <q-item-section>{{ item.place }}</q-item-section>
                      <q-item-section>{{ item.kg }}</q-item-section>
                      <q-item-section>
                        {{ item.category_name }}
                      </q-item-section>
                    </q-item>
                  </q-slide-item>
                </q-list>
              </div>
            </template>
          </q-splitter>
        </CardSection>
      </Card>
    </DialogComponent>
    <DialogMoveToFax
      v-model:show="showMoveToFaxDialog"
      v-model:values="faxTableReactiveProperties.selected"
    />
    <DialogSendSms
      v-model:show="showSendSmsDialog"
      v-model:values="sendSmsDialogData"
      :fax="currentFaxItem"
    />
  </q-page>
</template>

<script>
import { getUrl } from "src/tools/url";
import showNotif from "src/mixins/showNotif";
import ExportDataMixin from "src/mixins/ExportData";
import { sortArrayCollection } from "src/utils/sort";
import {
  getClientCodes,
  getCategories,
  getShopsList,
  setCategoriesStoreHouseData,
  combineStoreHouseData,
  getDeliveryMethodsList,
  getFaxes,
} from "src/utils/FrequentlyCalledFunctions";
import StorehouseDataMixin from "src/mixins/StorehouseData";
import {
  numberFormat,
  thingsFilter,
  optionsFilter,
  isBrendCategory,
} from "src/utils";
import TableComponent from "src/components/Elements/Table/Table.vue";
import IconBtn from "src/components/Buttons/IconBtn.vue";
import RoundBtn from "src/components/Buttons/RoundBtn.vue";
import BaseBtn from "src/components/Buttons/BaseBtn.vue";
import DialogFaxData from "src/components/Dialogs/DialogFaxData.vue";
import StorehouseDataHistory from "src/components/History/StorehouseDataHistory.vue";
import DialogComponent from "src/components/Dialogs/DialogComponent.vue";
import CountCategories from "src/components/CountCategories.vue";
import PopupEdit from "src/components/PopupEdit.vue";
import SearchSelect from "src/components/Elements/SearchSelect.vue";
import List from "src/components/Elements/List/List.vue";
import ItemSection from "src/components/Elements/List/ItemSection.vue";
import ItemLabel from "src/components/Elements/List/ItemLabel.vue";
import ListItem from "src/components/Elements/List/ListItem.vue";
import Card from "src/components/Elements/Card/Card.vue";
import CardSection from "src/components/Elements/Card/CardSection.vue";
import MoveToFaxBtn from "src/components/Buttons/MoveToFaxBtn.vue";
import DialogMoveToFax from "src/components/Dialogs/DialogMoveToFax.vue";
import DialogSendSms from "src/components/Dialogs/DialogSendSms.vue";
import {
  first,
  indexOf,
  get,
  cloneDeep,
  isEmpty,
  forEach,
  map,
  size,
  toNumber,
  findIndex,
  assign,
  includes,
} from "lodash";
import { useCodesStore } from "stores/codes";
const codesStore = useCodesStore();
import { useCategoryStore } from "stores/category";
const categoryStore = useCategoryStore();
import { useFaxesStore } from "stores/faxes";
const faxesStore = useFaxesStore();
import { useShopListStore } from "stores/shop-list";
const shopListStore = useShopListStore();
import { useStorehouseStore } from "stores/storehouse";
const storehouseStore = useStorehouseStore();
import { useDeliveryMethodsStore } from "stores/delivery-methods";
const deliveryMethodsStore = useDeliveryMethodsStore();

export default {
  name: "FaxComponent",
  components: {
    TableComponent,
    IconBtn,
    List,
    ItemSection,
    ItemLabel,
    ListItem,
    BaseBtn,
    DialogFaxData,
    StorehouseDataHistory,
    Card,
    CardSection,
    DialogComponent,
    CountCategories,
    PopupEdit,
    SearchSelect,
    MoveToFaxBtn,
    DialogMoveToFax,
    DialogSendSms,
    RoundBtn,
  },
  mixins: [showNotif, ExportDataMixin, StorehouseDataMixin],
  data() {
    return {
      loading: false,
      dataSearchFax: {},
      showSendSmsDialog: false,
      sendSmsDialogData: [],
      isTransfer: false,
      addToSaveArray: [],
      search: null,
      searchStorehouseData: null,
      faxSideData: [],
      faxSideDataTransferIds: [],
      storehouseSideData: [],
      storehouseSideDataTransferIds: [],
      splitterModel: 50,
      showFaxDataDialog: false,
      dialogTransferFromStorehouse: false,
      localFaxEditData: {},
      combineTableData: true,
      faxTableData: [],
      showMoveToFaxDialog: false,
      faxTableProperties: {
        columns: [
          {
            name: "code_place",
            label: "Код",
            align: "center",
            field: "code_place",
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
            name: "cube",
            label: "Куб",
            field: "cube",
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
            name: "in_cargo",
            label: "Доставлен",
            field: "in_cargo",
            align: "center",
            sortable: true,
          },
          {
            name: "shop",
            label: "Магазин",
            field: "shop",
            align: "center",
            sortable: true,
          },
          {
            name: "delivery_method_name",
            label: "Способ доставки",
            field: "delivery_method_name",
            align: "center",
            sortable: true,
          },
          {
            name: "department",
            label: "Отделение",
            field: "department",
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
          {
            name: "things",
            label: "Опись",
            field: "things",
            align: "center",
            sortable: true,
          },
        ],
      },
      faxTableReactiveProperties: {
        selected: [],
        visibleColumns: [
          "code_client_name",
          "place",
          "kg",
          "in_cargo",
          "category_name",
          "delivery_method_name",
          "department",
        ],
        title: "",
      },
      visibleColumns: [
        "code_client_name",
        "place",
        "kg",
        "for_kg",
        "for_place",
        "category_name",
        "in_cargo",
        "delivery_method_name",
        "department",
      ],
      fullVisibleColumns: [
        "code_place",
        "code_client_name",
        "for_kg",
        "for_place",
        "place",
        "kg",
        "category_name",
        "things",
        "notation",
        "shop",
        "in_cargo",
        "delivery_method_name",
        "department",
        "cube",
      ],
    };
  },
  computed: {
    faxData() {
      return faxesStore.getFaxData;
    },
    faxCategoriesData() {
      return faxesStore.getFaxCategoriesData;
    },
    storehouseData() {
      return storehouseStore.getStorehouseData;
    },
    currentFaxItem() {
      return faxesStore.getCurrentFaxItem;
    },
    categories() {
      return categoryStore.getCategories;
    },
    clientCodes() {
      return codesStore.getCodes;
    },
    faxName() {
      return get(this.currentFaxItem, "name");
    },
    faxUploadStatus() {
      return get(this.currentFaxItem, "uploaded_to_cargo");
    },
    deliveryMethodsList() {
      return deliveryMethodsStore.getDeliveryMethodsList;
    },
  },
  watch: {
    faxData: {
      handler(val) {
        if (!get(first(val), "for_kg")) {
          const { visibleColumns } = this;
          const { fullVisibleColumns } = this;
          const indexForKg = indexOf(visibleColumns, "for_kg");
          const indexForKg2 = indexOf(fullVisibleColumns, "for_kg");
          if (indexForKg !== -1) {
            visibleColumns.splice(indexForKg, 2);
          }
          if (indexForKg2 !== -1) {
            fullVisibleColumns.splice(indexForKg2, 2);
          }
        }
        // const { faxData } = this;
        if (this.combineTableData) {
          this.faxTableData = sortArrayCollection(
            combineStoreHouseData(val),
            "code_client_name",
          );
        } else {
          this.faxTableData = sortArrayCollection(
            cloneDeep(val),
            "code_client_name",
          );
        }
        faxesStore.setFaxCategoriesData(setCategoriesStoreHouseData(val));
      },
      deep: true,
    },
    combineTableData: {
      handler: function set(val) {
        const { faxData } = this;
        if (val) {
          this.faxTableReactiveProperties.visibleColumns = this.visibleColumns;
          this.faxTableData = sortArrayCollection(
            combineStoreHouseData(faxData),
            "code_client_name",
          );
        } else {
          this.faxTableData = sortArrayCollection(
            cloneDeep(faxData),
            "code_client_name",
          );
          this.faxTableReactiveProperties.visibleColumns =
            this.fullVisibleColumns;
        }
      },
      immediate: true,
    },
  },
  created() {
    if (this.$route.params.searchField) {
      this.dataSearchFax = {
        field: this.$route.params.searchField,
        value: this.$route.params.searchValue,
      };
    }
  },
  mounted() {
    this.loading = true;
    Promise.all([
      this.getFax(this.$route.params.id),
      this.getFaxData(this.$route.params.id),
      getCategories(categoryStore),
      getClientCodes(codesStore),
      getDeliveryMethodsList(deliveryMethodsStore),
    ]).then(() => {
      this.loading = false;
    });
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    numberFormat,
    thingsFilter,
    optionsFilter,
    isBrendCategory,
    openDialogSendSms(allData, selected) {
      this.sendSmsDialogData = isEmpty(selected) ? allData : selected;
      this.showSendSmsDialog = true;
    },
    moveToFax() {
      this.showMoveToFaxDialog = true;
    },
    destroyEntry(data) {
      if (!isEmpty(data)) {
        const ids = [];
        forEach(data, (item) => {
          if (item.arr) {
            ids.push(...map(item.arr, "id"));
          } else {
            ids.push(item.id);
          }
        });
        this.showNotif(
          "warning",
          size(ids) > 1 ? "Удалить записи?" : "Удалить запись?",
          "center",
          [
            {
              label: "Отмена",
              color: "white",
              handler: () => {
                this.faxTableReactiveProperties.selected = [];
              },
            },
            {
              label: "Удалить",
              color: "white",
              handler: () => {
                this.$q.loading.show();
                this.$axios
                  .post(getUrl("destroyStorehouseData"), { ids })
                  .then(({ data: { status } }) => {
                    faxesStore.deleteEntryFromFaxData(ids);
                    this.faxTableReactiveProperties.selected = [];
                    this.$q.loading.hide();
                    this.showNotif(
                      "success",
                      size(ids) > 1
                        ? "Записи успешно удалены."
                        : "Запись успешно удалена.",
                      "center",
                    );
                  })
                  .catch(() => {
                    this.$q.loading.hide();
                    console.error("Ошибка запроса - destroyEntry");
                  });
              },
            },
          ],
        );
      }
    },
    async getFax(id) {
      if (
        isEmpty(this.currentFaxItem) ||
        toNumber(this.currentFaxItem.id) !== toNumber(id)
      ) {
        this.$axios
          .get(`${getUrl("fax")}/${id}`)
          .then(({ data: { fax } }) => {
            faxesStore.setCurrentFaxItem(fax);
          })
          .catch(() => {});
      }
    },
    saveDataInCombineTable(values) {
      this.$q.loading.show();
      this.$axios
        .post(getUrl("updateFaxCombineData"), values)
        .then(({ data: { updatedData } }) => {
          forEach(updatedData, (item) => {
            faxesStore.updateFaxData(item);
          });
          this.addToSaveArray = [];
          this.$q.loading.hide();
          this.showNotif("success", "Запись успешно обновлена.", "center");
        })
        .catch((errors) => {
          this.$q.loading.hide();
        });
    },
    addToAddSaveArray(val, key) {
      const findIndex = findIndex(this.addToSaveArray, { id: val.id });
      if (findIndex !== -1) {
        this.addToSaveArray[findIndex][key] = val[key];
      } else {
        const newObj = assign(
          {},
          {
            id: val.id,
            arr: val.arr,
            replacePrice: val.replacePrice,
          },
        );
        newObj[key] = val[key];
        this.addToSaveArray.push(newObj);
      }
    },
    exportFaxData(data) {
      const ids = [];
      forEach(data, ({ arr, id }) => {
        if (!isEmpty(arr)) {
          ids.push(...map(arr, "id"));
        } else {
          ids.push(id);
        }
      });
      this.exportDataToExcel(
        getUrl("exportFaxModerData"),
        {
          id: this.currentFaxItem.id,
          ids,
        },
        `${this.currentFaxItem.name}.xlsx`,
      );
    },
    exportFaxMailData(data) {
      const ids = [];
      forEach(data, ({ arr, id }) => {
        if (!isEmpty(arr)) {
          ids.push(...map(arr, "id"));
        } else {
          ids.push(id);
        }
      });
      this.exportDataToExcel(
        getUrl("exportFaxModerMailData"),
        {
          id: this.currentFaxItem.id,
          ids,
        },
        `${this.currentFaxItem.name}.xlsx`,
      );
    },
    async getFaxData(id) {
      // this.$q.loading.show();
      await this.$axios
        .get(`${getUrl("faxData")}/${id}`)
        .then(({ data: { faxData } }) => {
          faxesStore.setFaxData(faxData);
          this.faxTableData = combineStoreHouseData(faxData);
          // this.$q.loading.hide();
        })
        .catch(() => {
          // this.$q.loading.hide();
          console.error("Ошибка получения данных факса");
        });
    },
    viewEditDialog(val, event) {
      if (
        !includes(get(event, "target.classList"), "select_checkbox") &&
        !this.combineTableData
      ) {
        this.$q.loading.show();
        this.localFaxEditData = val;
        this.localFaxEditData.combineTableData = this.combineTableData;
        this.localFaxEditData.historyFunc = this.getStorehouseDataHistory;
        this.faxTableReactiveProperties.selected = [];

        setTimeout(() => {
          val.selected = !val.selected;
        }, 100);

        Promise.all([
          getClientCodes(codesStore),
          getShopsList(shopListStore),
          getCategories(categoryStore),
        ])
          .then(() => {
            this.showFaxDataDialog = true;
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
            console.warn("Ошибка при получении данных. Edit faxData");
          });
      }
    },
    openDialogTransferFromStorehouse() {
      this.dialogTransferFromStorehouse = true;
      this.$q.loading.show();
      Promise.all([
        storehouseStore.fetchStorehouseTableData(),
        getFaxes(faxesStore),
      ])
        .then(() => {
          // if (isEmpty(this.faxSideData)) {
          this.faxSideData = sortArrayCollection(
            cloneDeep(this.faxTableData),
            "code_client_name",
          );
          // }
          // if (isEmpty(this.storehouseSideData)) {
          // setTimeout(() => {
          this.storehouseSideData = sortArrayCollection(
            cloneDeep(this.storehouseData),
            "code_client_name",
          );
          // }, 100);
          // }
          this.dialogTransferFromStorehouse = true;
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
          console.warn(
            "Ошибка при получении данных. openDialogTransferFromStorehouse",
          );
        });
    },
    // Действие, когда пользователь закончил сдвиг элемента в лево, с факса в склад
    onLeft(item) {
      // this.faxSideDataTransferIds.push(item.id);
      // const indexId = findIndex(this.storehouseSideDataTransferIds, item.id);
      // if (indexId) {
      //     this.storehouseSideDataTransferIds.splice(indexId, 1);
      // }
      this.storehouseSideData.push(item);
      const index = findIndex(this.faxSideData, { id: item.id });
      this.faxSideData.splice(index, 1);
      this.$q.notify(
        `На склад ${item.code_client_name} код - (${item.place}м/${item.kg}кг)`,
      );
      this.isTransfer = true;
    },
    // Действие, когда пользователь закончил сдвиг элемента в любую сторону
    onAction({ reset }) {
      reset();
    },
    // Действие, когда пользователь закончил сдвиг элемента в право
    onRight(item) {
      // this.storehouseSideDataTransferIds.push(item.id);
      // const indexId = findIndex(this.faxSideDataTransferIds, item.id);
      // if (indexId) {
      //     this.faxSideDataTransferIds.splice(indexId, 1);
      // }
      this.faxSideData.push(item);
      const index = findIndex(this.storehouseSideData, { id: item.id });
      this.storehouseSideData.splice(index, 1);
      this.$q.notify(
        `В факс ${item.code_client_name} код - (${item.place}м/${item.kg}кг)`,
      );
      this.isTransfer = true;
    },
    saveTransfersData(faxData, storehouseData) {
      this.$q.loading.show();
      this.$axios
        .post(getUrl("transfersStoreFax"), {
          id: this.$route.params.id,
          faxIds: map(faxData, "id"),
          storehouseIds: map(storehouseData, "id"),
        })
        .then(({ data }) => {
          this.faxSideData = [];
          this.storehouseSideData = [];
          this.getFaxData(this.$route.params.id);
          storehouseStore.fetchStorehouseTableData();
          this.isTransfer = false;
          this.closeDialogTransferFromStorehouse();
          this.$q.loading.hide();
          this.showNotif("success", "Данные успешно сохранены.", "center");
        })
        .catch(() => {
          this.$q.loading.hide();
          console.error("Произошла ошибка в запросе - saveTransfersData");
        });
    },
    closeDialogTransferFromStorehouse() {
      if (this.isTransfer) {
        this.showNotif("warning", "Сохранить изменения?", "center", [
          {
            label: "Нет",
            color: "white",
            handler: () => {
              this.isTransfer = false;
              this.dialogTransferFromStorehouse = false;
            },
          },
          {
            label: "Да",
            color: "white",
            handler: () => {
              this.saveTransfersData(this.faxSideData, this.storehouseSideData);
            },
          },
        ]);
      } else {
        this.isTransfer = false;
        this.dialogTransferFromStorehouse = false;
      }
    },
    updatePricesInFax(faxId) {
      this.$q.loading.show();
      this.$axios
        .get(`${getUrl("updatePricesInFax")}/${faxId}`)
        .then(({ data: { faxData } }) => {
          faxesStore.setFaxData(faxData);
          this.faxTableData = combineStoreHouseData(faxData);
          this.$q.loading.hide();
          this.showNotif("success", "Цены успешно обновлены.", "center");
        })
        .catch(() => {
          this.$q.loading.hide();
          console.error("Ошибка получения данных факса");
        });
    },
  },
};
</script>
