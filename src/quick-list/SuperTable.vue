<template>
  <div>
    <template v-if="!justCreateButton">
      <template v-if="isForSelectingRelation">
        <SuperSelect
            ref="selectRef"
            :readonly="disabled"
            :allowAll="allowAll"
            dense
            :hideLabel="hideLabel"
            :page="options.page"
            @update:page="pageUpdate"
            :maxPages="maxPages"
            @click="activateAndFetchData"
            :items="items"
            :loading="loading"
            :rules="rules"
            :modelValue="modelValue"
            @update:modelValue="clickRow"
            :titleVal="titleVal"
            :model="model"
            :modelField="modelField"
            :activated="activated"
            @search="doSearch"
            :errorMessage="errorMessage"
            :hideBottomSpace="selectHideBottomSpace"
        >
          <CreateButton
              v-if="
              superOptions.model.rules.creatable() &&
              canCreateComputed &&
              !hideCreate
            "
              :modelFields="modelFields"
              @createItem="createItem"
              :model="model"
              :superOptions="superOptions"
              :template="templateForm"
              :createButtonText="createButtonText"
          />
        </SuperSelect>

        <!--:key="filterInput.name"-->
        <!--:model="filterInput.meta.field.parent"-->
        <!--:modelField="filterInput"-->
        <!--v-model="filterValsRef[filterInput.name]"-->
      </template>
      <template v-else>
        <SuperTableTopBar
            v-model="filterValsRef"
            v-model:filterNames="filterNamesRef"
            v-model:activeTab="activeTab"
            v-model:search="search"
            ref="SuperTableTopBar"
            :superOptions="superOptions"
            :viewAs="viewAs"
            :downloadables="downloadables"
            :noBorder="noBorder"
            :canCreateComputed="canCreateComputed"
            :canEdit="canEdit"
            :hideCreate="hideCreate"
            :isForSelectingRelation="isForSelectingRelation"
            :startFieldName="startFieldName"
            :longField="longField"
            :allowedFilters="allowedFilters"
            :templateListTable="templateListTable"
            :templateForm="templateForm"
            @createItem="createItem"
        />
        <div class="">
          <template v-if="activeTab == 'table'">
            <div>
              <!--:id="`pdfBody${toHtmlIdSafeString(downloadables.pdf?.title)}`"-->
              <template v-if="!noBorder">
                <q-card class="">
                  <SuperTableTable
                      ref="SuperTableTableRef"
                      :items="items"
                      :loading="loading"
                      @clickRow="clickRow"
                      :templateListTable="templateListTable"
                      :hidePagination="hidePagination"
                      :excludedCols="excludedCols"
                      :model="model"
                      :displayMapField="displayMapField"
                      :canEdit="canEdit"
                      @fetchData="fetchData"
                      :loadingError="loadingError"
                  />
                </q-card>
              </template>
              <template v-else>
                <SuperTableTable
                    :items="items"
                    :loading="loading"
                    @clickRow="clickRow"
                    :templateListTable="templateListTable"
                    :hidePagination="hidePagination"
                    :excludedCols="excludedCols"
                    :model="model"
                    :displayMapField="displayMapField"
                    :canEdit="canEdit"
                    @fetchData="fetchData"
                    :loadingError="loadingError"
                />
              </template>
            </div>
            <!--:superOptions="superOptions"-->
            <!--:itemsLength="itemsLength"-->
            <!--@clickRow="clickRow"-->
            <!--:pagination="options"-->
            <!--@update:pagination="updatePagination"-->
            <div class="flex flex-center">
              <q-pagination
                  class="q-mt-sm"
                  :class="noBorder ? 'q-mx-md' : ''"
                  v-if="!hidePagination && items.length"
                  v-model="options.page"
                  @update:modelValue="pageUpdate"
                  :max="maxPages"
                  input
              />
            </div>
            <!--@update:rows-per-page="updateRowsPerPage"-->
          </template>
          <template v-if="activeTab == 'grid'">
            <div class="">
              <SuperTableGrid
                  :items="items"
                  @clickRow="clickRow"
                  :superOptions="superOptions"
                  :unClickable="unClickable"
                  :templateListGrid="templateListGrid"
                  @fetchData="fetchData"
                  :excludedCols="excludedCols"
                  :loading="loading"
                  :gridColWidth="gridColWidth"
              />
            </div>
          </template>
          <template v-if="activeTab == 'map'">
            <SuperTableMap
                :mapHeaders="mapHeaders"
                :items="items"
                @clickRow="clickRow"
                :superOptions="superOptions"
                @fetchData="fetchData"
                :unClickable="unClickable"
                :templateListGrid="templateListGrid"
            />
          </template>
          <template v-if="activeTab == 'calendar'">
            <template v-if="!noBorder">
              <q-card class="q-pa-sm">
                <!--<SuperTableCalendarWrapper-->
                <!--    :startFieldName="startFieldName"-->
                <!--    :endFieldName="endFieldName"-->
                <!--    :items="items"-->
                <!--    @clickRow="clickRow"-->
                <!--    :superOptions="superOptions"-->
                <!--    @editItem="editItem"-->
                <!--    @deleteItem="deleteItem"-->
                <!--    :templateListGrid="templateListGrid"-->
                <!--    :templateListCalendar="templateListCalendar"-->
                <!--    :unClickable="unClickable"-->
                <!--    :loading="loading"-->
                <!--/>-->
                <!--&lt;!&ndash;:calendarMode="calendarMode"&ndash;&gt;-->

                <SuperCalendar
                    @clickRow="clickRow"
                    @fetchData="fetchData"
                    :loading="loading"
                    :mixedConfigs="[
                    {
                      templateListCalendar: templateListCalendar,
                      templateListGrid: templateListGrid,
                      startFieldName: startFieldName,
                      endFieldName: endFieldName,
                      items: items,
                      superOptions: superOptions,
                      unClickable: unClickable,
                    },
                  ]"
                />
                <!--:calendarMode="calendarMode"-->
              </q-card>
            </template>
            <template v-else>
              <SuperCalendar
                  @clickRow="clickRow"
                  @fetchData="fetchData"
                  :loading="loading"
                  :mixedConfigs="[
                  {
                    templateListCalendar: templateListCalendar,
                    templateListGrid: templateListGrid,
                    startFieldName: startFieldName,
                    endFieldName: endFieldName,
                    items: items,
                    superOptions: superOptions,
                    unClickable: unClickable,
                  },
                ]"
              />
            </template>
          </template>
        </div>
      </template>
    </template>
    <template v-else>
      <CreateButton
          v-if="
          superOptions.model.rules.creatable() &&
          canCreateComputed &&
          !hideCreate
        "
          :modelFields="modelFields"
          @createItem="createItem"
          :model="model"
          :superOptions="superOptions"
          :template="templateForm"
          :createButtonText="createButtonText"
      />
    </template>
    <CrudModal
        :templateForm="templateForm"
        @fetchData="fetchData"
        @createdItem="createdItem"
        ref="CrudModalRef"
        :superOptions="superOptions"
        :parentKeyValuePair="parentKeyValuePair"
    />
  </div>
</template>

<script>
// import CreateEditForm from "./CreateEditForm.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import SuperTableGrid from "./SuperTableGrid.vue";
import SuperTableTable from "./SuperTableTable.vue";
import SuperTableMap from "./SuperTableMap.vue";
import SuperSelect from "./SuperSelect.vue";
import FilterTime from "./FilterTime.vue";
import FilterPlace from "./FilterPlace.vue";
import DestructableExpansionPanels from "./DestructableExpansionPanels.vue";
import CreateButton from "./CreateButton.vue";
import RelationComponent from "./RelationComponent.vue";

import { defineAsyncComponent } from "vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import SearchGooglePlace from "./SearchGooglePlace.vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PdfTemplate from "./PdfTemplate.vue";
import { Helpers } from "../index";
import SuperCalendar from "./SuperCalendar.vue";
import CrudModal from "./CrudModal.vue";
import SuperTableTopBar from "./SuperTableTopBar.vue";
// import html2pdf from 'html2pdf.js';

const AsyncComponentCreateEditForm = defineAsyncComponent(
    () => import("./CreateEditForm.vue"),
);
const AsyncComponentSuperTable = defineAsyncComponent(
    () => import("./SuperTable.vue"),
);

export default {
  name: "SuperTable",
  components: {
    SuperTableTopBar,
    CrudModal,
    SuperCalendar,
    PdfTemplate,
    SearchGooglePlace,
    RecordFieldsForDisplayGeneric,
    RelationComponent,
    CreateButton,
    DestructableExpansionPanels,
    FilterPlace,
    FilterTime,
    SuperSelect,
    SuperTableMap,
    SuperTableTable,
    SuperTableGrid,
    CreateEditForm: AsyncComponentCreateEditForm,
    SuperTable: AsyncComponentSuperTable,
  },
  props: {
    titleVal: {
      type: String,
      default: "",
    },
    downloadables: {
      type: Object,
      default: {},
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    justCreateButton: {
      type: Boolean,
      default: false,
    },
    createButtonText: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    allowedFilters: {
      type: Array,
      default: null,
    },
    allowAll: {
      type: Boolean,
      default: false,
    },
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateForm: {
      type: Object,
      default() {
        return {};
      },
    },
    viewAs: {
      type: Object,
      default() {
        return {
          show: ["table", "grid", "map", "calendar"],
          default: "table",
        };
      },
    },
    hideCreate: {
      type: Boolean,
      default() {
        return false;
      },
    },
    filterVals: {
      type: Object,
      default() {
        return {};
      },
    },
    filterNames: {
      type: Object,
      default() {
        return {};
      },
    },
    templateListTable: {
      type: Object,
      default() {
        return {};
      },
    },
    templateListGrid: {
      type: Object,
      default() {
        return {};
      },
    },
    templateListCalendar: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    hidePagination: {
      type: Boolean,
      default() {
        return false;
      },
    },
    displayMapField: {
      type: Boolean,
      default() {
        return false;
      },
    },
    isForSelectingRelation: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelValue: {
      type: [Number, Object, String],
      default() {
        return null;
      },
    },
    showMap: {
      type: Boolean,
      default() {
        return false;
      },
    },
    gridColWidth: {
      type: Number,
      default() {
        return 3;
      },
    },
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // canEdit: {
    //   type: Boolean,
    //   default() {
    //     return false;
    //   },
    // },
    parentKeyValuePair: {
      type: Object,
      default() {
        return {};
      },
    },
    createPayloadExtras: {
      type: Object,
      default() {
        return {};
      },
    },
    relationships: {
      type: Array,
      default() {
        return [];
      },
    },
    fetchFlags: {
      type: Object,
      default() {
        return {};
      },
    },
    defaultViewModeProp: {
      type: String,
      default() {
        return "";
      },
    },
    rules: {
      type: Array,
      default() {
        return [() => true];
      },
    },
    modelField: {
      type: Object,
      default: () => ({}),
    },
    errorMessage: {
      type: String,
      default() {
        return null;
      },
    },
    selectHideBottomSpace: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // calendarMode: 'List',
      loadingError: false,
      search: "",
      years: Array.from(
          { length: 5 },
          (_, index) => new Date().getFullYear() - index,
      ), // last 5 years including this year
      itemsLength: 1,
      activated: false,
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        groupBy: [],
      },
      highlightedRow: null,
      filterValsRef: {},
      filterNamesRef: {},
      items: [],
      activeTab: "",
      // activeTab: {
      //   "label": "Table",
      //   "value": "table"
      // },
    };
  },
  computed: {
    // activeTab() {
    //   return this.$refs.SuperTableTopBar?.activeTab;
    // },
    longField() {
      let longField = this.mapHeaders.find((field) => {
        return field.usageType == "mapExtraGeoLocLong";
      });
      return longField;
    },
    startFieldName() {
      const result = Helpers.getFieldFromModelOrParent(
          this.superOptions.headers,
          "timeRangeStart",
      );
      return result;
    },
    endFieldName() {
      const result = Helpers.getFieldFromModelOrParent(
          this.superOptions.headers,
          "timeRangeEnd",
      );
      return result;
    },
    // optionsComputed: {
    //   get() {
    //     return this.options;
    //   },
    //   set(value) {
    //     if (!this.loading) {
    //       this.fetchData();
    //     }
    //     this.options = value;
    //   },
    // },
    parentField() {
      const result = this.superOptions.modelFields.find((field) => {
        return field.name == this.parentKeyValuePair.parentFKey;
      });
      return result;
    },
    canCreateComputed() {
      if (
          this.parentField &&
          typeof this.parentField.fieldExtras.linkablesRule === "function"
      ) {
        const linkablesRule = this.parentField.fieldExtras.linkablesRule();
        if (
            linkablesRule[this.model.primaryKey] &&
            this.parentKeyValuePair.parentFVal
        ) {
          const array = linkablesRule[this.model.primaryKey]
              .split(",")
              .map(Number);
          if (!array.includes(this.parentKeyValuePair.parentFVal)) {
            return false;
          }
        }
      }
      return true;
    },
    superOptions() {
      return {
        headers: this.headers,
        modelFields: this.modelFields,
        displayMapField: this.displayMapField,
        model: this.model,
        canEdit: this.canEdit,
      };
    },
    excludedCols() {
      let result = [];
      if (this.parentKeyValuePair.parentFKey) {
        result = [this.parentKeyValuePair.parentFKey];
      }
      return result;
    },
    canEdit() {
      const result = this.model.rules.creatable();
      return result;
    },
    filterValsComp() {
      const result = {
        ...this.filterValsRef,
      };
      if (
          this.parentKeyValuePair.parentFKey &&
          this.parentKeyValuePair.parentFVal
      ) {
        result[this.parentKeyValuePair.parentFKey] =
            this.parentKeyValuePair.parentFVal;
      }
      return result;
    },
    headers() {
      const result = QuickListsHelpers.SupaerTableHeaders(
          this.model,
          this.excludedCols,
          this.canEdit,
          this.displayMapField,
      );
      return result;
    },
    mapHeaders() {
      const result = QuickListsHelpers.SupaerTableHeaders(
          this.model,
          this.excludedCols,
          this.canEdit,
          true,
      );
      return result;
    },
    modelFields() {
      const result = QuickListsHelpers.computedAttrs(
          this.model,
          this.excludedCols,
      );
      return result;
    },
    // itemsQueried() {
    //   const result = this.model
    //       .query()
    //       .where((item) => {
    //         return this.quickListsGetIfMatchesAllChecks(item, this.filterValsComp);
    //       })
    //       .withAll()
    //       .orderBy(`${this.model.primaryKey}`, "desc")
    //       .get();
    //   return result;
    // },
    pKey() {
      return this.model.primaryKey;
    },
    maxPages() {
      return Math.ceil(this.itemsLength / this.options.itemsPerPage);
    },
  },
  methods: {
    createItem() {
      this.$refs.CrudModalRef.createItem();
    },

    doSearch(searchTerm) {
      this.filterValsRef[this.model.titleKey] = searchTerm;
      this.fetchData();
    },
    pageUpdate(page) {
      this.options = {
        ...this.options,
        page: page,
        // itemsPerPage: page.rowsPerPage,
        // sortBy: page.sortBy,
        // descending: page.descending,
      };
      this.fetchData();
    },
    updatePagination(pagination) {
      this.options = {
        ...this.options,
        page: pagination.page,
        itemsPerPage: pagination.rowsPerPage,
        sortBy: pagination.sortBy,
        descending: pagination.descending,
      };
      this.fetchData();
    },
    // updateRowsPerPage(rowsPerPage) {
    //   this.options = {
    //     ...this.options,
    //     itemsPerPage: rowsPerPage,
    //     page: 1,
    //   };
    //   this.fetchData();
    // },
    quickListsGetIfMatchesAllChecks(item, filterVals) {
      return QuickListsHelpers.quickListsGetIfMatchesAllChecks(item, filterVals);
    },

    clickRow(pVal, item) {
      if (this.isForSelectingRelation) {
        this.highlightedRow = pVal;
      } else {
        if (this.model.rules.readable(item)) {
          if (typeof this.model.openRecord === "function") {
            this.model.openRecord(item[this.pKey], item, this.$router);
          } else {
            this.$emit("clickRow", pVal, item, this.$router);
          }
        }
      }

      this.$emit("update:modelValue", pVal);

      let title = null
      if (pVal){
        title = item[this.model.titleKey]
      }
      this.$emit("update:titleVal", title);
    },
    createdItem(item) {
      if (this.isForSelectingRelation) {
        this.$emit(
            "update:modelValue",
            item[this.superOptions.model.primaryKey],
        );
        this.$refs.selectRef.hidePopup();
      }
    },
    applyFilters(items, filterVals) {
      const groupedFilters = {};

      // Group filterVals by relation
      Object.keys(filterVals).forEach((filterKey) => {
        const [relation, attr] = filterKey.split(".");
        if (!groupedFilters[relation]) {
          groupedFilters[relation] = {};
        }
        groupedFilters[relation][attr] = filterVals[filterKey];
      });

      return items.filter((item) => {
        return Object.keys(groupedFilters).every((relation) => {
          const relationFilters = groupedFilters[relation];
          if (!item[relation]) return false;
          return item[relation].some((relatedItem) => {
            return Object.keys(relationFilters).every(
                (attr) => relatedItem[attr] === relationFilters[attr],
            );
          });
        });
      });
    },
    async fetchData() {
      try {
        if (!this.activated && this.isForSelectingRelation) return;

        this.loading = true;
        this.loadingError = false;
        let rules = [];
        // everything from here down could be in helper methods
        if (this.model.rules?.readables) {
          rules = this.model.rules.readables();
        }

        let extraHeaderComputed = {};
        let flagsComputed = {};
        if (this.model.adapter == "supabase") {
          extraHeaderComputed = {
            Prefer: "count=exact",
          };
          flagsComputed = {
            order: "id.desc",
          };
        } else if (this.model.adapter == "laravel") {
          extraHeaderComputed = {};
          flagsComputed = {
            sort: `-${this.model.primaryKey}`,
            // =------------------------------------
            per_page: this.options.itemsPerPage,
            page: this.options.page,
          };
        }
        const response = await this.model.FetchAll(
            // =========================
            this.relationships,
            {
              ...rules,
              ...flagsComputed,
              /// -----------------------
              ...this.fetchFlags,
            },
            extraHeaderComputed,
            {
              page: this.options.page,
              limit: this.options.itemsPerPage,
              //============================
              filters: this.filterValsComp,
              clearPrimaryModelOnly: false,
            },
        );

        // this.items = this.applyFilters(response.response.data.data, this.filterValsComp);
        // this.items = this.applyFilters(response.response.data.data, this.filterVals);

        if (this.model.adapter == "supabase") {
          this.items = response.response.data.data;
        } else if (this.model.adapter == "laravel") {
          this.items = response.response.data.data;
        } else if (this.model.adapter === "airtable") {
          this.items = response.response.data.records.map(record => {
            return {
              id: record.id,
              createdTime: record.createdTime,
              ...record.fields
            };
          });
        }

        // console.log("this.items")
        // console.log(this.items)
        // this.items = response.response.data.data

        this.loading = false;
        let count = 0;

        if (this.model.adapter == "supabase") {
          if (response?.response?.headers?.["content-range"]) {
            const contentRange = response?.response?.headers?.["content-range"];
            count = contentRange.split("/")[1];
          }
        } else if (this.model.adapter == "laravel") {
          count = response.response.data.total;
        } else if (this.model.adapter === "airtable") {

        }
        this.itemsLength = count; // Assuming your API returns a total count
        this.$emit("fetchComplete", this.model.name, this.items);
      } catch (error) {
        this.loading = false;
        this.loadingError = true;
      }
    },
    activateAndFetchData() {
      if (!this.activated && !this.disabled) {
        this.activated = true;
        this.fetchData();
      }
    },
  },
  watch: {
    items(newVal) {
      if (newVal.length) {
        this.$emit("update:items", newVal);
      }
    },
    search(value) {
      if (!this.disabled) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.doSearch(value);
        }, 300);
      }
    },


    filterVals: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          // Compare serialized objects
          if(this.isForSelectingRelation){
            this.activated = false;
          }
          this.items = [];


          this.filterValsRef = JSON.parse(JSON.stringify(newVal));
        }

      },
      deep: true,
    },
    filterValsRef: {
      handler(newVal, oldVal) {
        if (!this.loading && !this.justCreateButton) {
          this.fetchData();
        }

        this.$emit("update:filterVals", newVal);
      },
      deep: true,
    },

    // filterNames: {
    //   handler(newVal, oldVal) {
    //     if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    //       this.filterNamesRef = JSON.parse(JSON.stringify(newVal));
    //     }
    //   },
    //   deep: true,
    // },
    // filterNamesRef: {
    //   handler(newVal, oldVal) {
    //     this.$emit("update:filterNames", newVal);
    //   },
    //   deep: true,
    // },
  },
  mounted() {
    QuickListsHelpers.bindDeepPropToRef(this, [
      // { prop: "filterVals", refName: "filterValsRef" },
      { prop: "filterNames", refName: "filterNamesRef" },
    ]);

    // this.filterValsRef = {...this.filterVals};
    // this.filterNamesRef = {...this.filterNames};

    this.$emit("superTableMounted");

    this.activeTab = this.viewAs.default;

    // if (this.quickListsIsMobile) {
    //   this.activeTab = "grid";
    // } else if (this.defaultViewModeProp !== "") {
    //   this.activeTab = this.defaultViewModeProp;
    // } else if (this.templateOverview?.defaultViewMode) {
    //   this.activeTab = this.templateOverview.defaultViewMode;
    // }

    if (this.activated || !this.isForSelectingRelation) {
      // if (!this.loading && !this.justCreateButton) {
      if (!this.justCreateButton) {
        this.fetchData();
      }
    }
  },
};
</script>

<style lang="scss">
//.highlighted {
//  background-color: #f0f0f0;
//}
</style>
