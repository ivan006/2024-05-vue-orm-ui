<template>
  <div>
    <template v-if="filteredChildRelations.length">

      <!--      <pre>{{headers}}</pre>-->
      <q-tabs
          v-model="activeTab"
          align="left"
      >
        <q-tab :name="'tab'"> Overview </q-tab>
        <q-tab :name="'special-tab-map'" v-if="someChildrenCanBeMapped"> Map </q-tab>
        <q-tab :name="'special-tab-calendar'" v-if="someChildrenCanBeCalendared"> Calendar </q-tab>
        <q-tab
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
        >
          {{ relation.field.label }}
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="activeTab">
        <q-tab-panel name="tab">
          <template v-if="!loading">
            <OverviewTab
                :item="item"
                :superOptions="superOptions"
                :templateOverview="templateOverview"
                :filteredChildRelations="filteredChildRelations"
                :childRelations="childRelations"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </OverviewTab>
          </template>
          <template v-else>
            Loading...
          </template>
        </q-tab-panel>

        <q-tab-panel
            :name="'special-tab-calendar'"
        >
          ...
        </q-tab-panel>
        <q-tab-panel
            :name="'special-tab-map'"
        >
          ...
        </q-tab-panel>
        <q-tab-panel
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
        >
          <SuperTable
              :ref="`tab-${index}`"
              :parentKeyValuePair="parentKeyValuePair(relation)"
              :model="relation.field.meta.field.related"
              :canEdit="canEdit"
              :forcedFilters="filters(relation)"
              @clickRow="(pVal, item) => {clickRow(pVal, item, relation)}"
          >
            <template v-if="$slots[relation.field.name]" v-slot:create>
              <slot :name="relation.field.name" />
            </template>
          </SuperTable>
        </q-tab-panel>
      </q-tab-panels>
    </template>
    <template v-else>
      <template v-if="!loading">
        <OverviewTab
            :item="item"
            :superOptions="superOptions"
            :templateOverview="templateOverview"
            :filteredChildRelations="filteredChildRelations"
            :childRelations="childRelations"
            @editItem="editItem"
            @deleteItem="deleteItem"
        >
          <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps"></slot>
          </template>
        </OverviewTab>
      </template>
      <template v-else>
        <div class="text-center q-pa-md">Loading...</div>
      </template>
    </template>

    <template v-if="canEdit">

      <template v-if="superOptions.canEdit">
        <q-dialog
            v-model="editItemData.showModal"
            @update:modelValue="formServerErrors = {};"
        >
          <CreateEditForm
              titlePrefix="Edit"
              v-if="editItemData.showModal"
              v-model="editItemData.data"
              @submit="editItemSubmit"
              @cancel="editItemData.showModal = false; formServerErrors = {};"
              :superOptions="superOptions"
              :template="templateForm"
              style="width: 700px; max-width: delete me;"
              :formServerErrors="formServerErrors"
          />
        </q-dialog>

        <q-dialog v-model="deleteItemData.showModal" >
          <q-card style="width: 500px; max-width: delete me;">
            <q-card-section class="q-pt-md q-pb-md q-pl-md q-pr-md">
              <div class="text-h6">Delete Item</div>
            </q-card-section>
            <q-card-section>
              <p>Are you sure you want to delete this item?</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn @click="deleteItemData.showModal = false" flat>Cancel</q-btn>
              <q-btn @click="deleteItemSubmit" color="negative" flat>Delete</q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </template>
  </div>
</template>

<script>
import SuperTable from "./SuperTable.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import SuperTableTable from "./SuperTableTable.vue";
import OverviewTab from "./OverviewTab.vue";
import {defineAsyncComponent} from "vue";
import {Helpers} from "../index";
const AsyncCreateEditFormComponent = defineAsyncComponent(() =>
    import('./CreateEditForm.vue')
);

export default {
  name: "SuperRecord",
  components: {
    CreateEditForm: AsyncCreateEditFormComponent,
    OverviewTab,
    SuperTableTable,
    RecordFieldsForDisplayCustom,
    RecordFieldsForDisplayGeneric,
    SuperTable,
  },
  props: {
    hideRelations: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateOverview: {
      type: Object,
      default() {
        return {};
      },
    },
    templateForm: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    displayMapField: {
      type: Boolean,
      default: false,
    },
    relationships: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      deleteItemData: {
        showModal: false,
        data: null,
      },
      editItemData: {
        showModal: false,
        data: null,
      },
      activeTab: 'tab',
      loading: true,
      initialLoadHappened: false,
      item: {},
      formServerErrors: {},
    };
  },
  computed: {
    someChildrenCanBeCalendared() {
      return this.childRelations.some(
          child =>  child.canBeCalendared
      )
    },
    someChildrenCanBeMapped() {
      return this.childRelations.some(
          child =>  child.canBeMapped
      )
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
    fieldsUsedInOverview() {
      // let result = {
      //   dataIndicators: [],
      //   cols: [],
      // };
      const result = []
      if (this.templateOverview && this.templateOverview.cols) {
        for (const col of this.templateOverview.cols) {
          if (col.cols) {
            for (const col2 of col.cols) {
              if (col2.dataPoint.field) {
                result.push(col2.dataPoint.field);
              }
            }
          } else {
            if (col.dataPoint.field) {
              result.push(col.dataPoint.field);
            }
          }
        }
      }

      return result;
    },
    canEdit() {
      return true;
    },
    childRelations() {
      const fields = QuickListsHelpers.computedAttrs(this.model, []);
      const result = [];

      for (let fieldName in fields) {
        const field = fields[fieldName];
        if (field.usageType.startsWith("relChildren")) {
          const child = {
            field,

            // currentParentRecord: {
            //   item: this.item,
            //   model: this.model,
            //   relationType: field.usageType,
            //   foreignKeyToParentRecord: field.meta.field.foreignKey,
            // },
          }



          const headers = QuickListsHelpers.SupaerTableHeaders(
              field.meta.field.related
          )

          const startfield = Helpers.getFieldFromModelOrParent(headers, 'timeRangeStart');

          if (startfield){
            child.canBeMapped = true
          } else {
            child.canBeMapped = false
          }

          let longField = Helpers.getFieldFromModelOrParent(headers, 'mapExtraGeoLocLong');

          if (longField){
            child.canBeCalendared = true
          } else {
            child.canBeCalendared = false
          }



          result.push(child);
        }
      }
      console.log("*")
      console.log(result)
      return result;
    },
    filteredChildRelations() {
      let result = [];
      if (!this.hideRelations){
        for (const childRelation of this.childRelations) {
          if (!this.fieldsUsedInOverview.includes(childRelation.field.name)) {
            result.push(childRelation);
          }
        }
      }
      return result;
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
    // item() {
    //   return this.model.query().whereId(this.id).withAll().get()[0];
    // },
    modelFields() {
      return QuickListsHelpers.computedAttrs(this.model, []);
    },
  },
  methods: {
    clickRow(pVal, item, relation) {
      relation.field.meta.field.related.openRecord(pVal, item, this.$router)
    },
    parentKeyValuePair(relation) {
      const fKey = relation.field.meta.field.foreignKey

      const result = {
        parentFKey: fKey,
        parentFVal: this.item[this.model.primaryKey],
        parentItem: this.item,
      }
      return result
    },
    deleteItem(item) {

      this.$emit("deleteItem", item);

      this.deleteItemData.data = item;
      this.deleteItemData.showModal = true;
    },
    deleteItemSubmit() {
      this.superOptions.model.Delete(this.deleteItemData.data.id).then(() => {
        this.fetchData();
      });
      this.deleteItemData.showModal = false;
    },
    editItem(item) {
      this.$emit("editItem", item);

      this.editItemData.data = {...item};
      this.editItemData.showModal = true;
    },
    editItemSubmit() {
      const payload = QuickListsHelpers.preparePayload(
          this.editItemData.data,
          this.superOptions.modelFields
      );

      this.superOptions.model.Update(payload)
          .then(() => {
            this.fetchData();
            this.editItemData.showModal = false;
            this.formServerErrors = {};
          })
          .catch((err) => {
            this.formServerErrors = err.response.data;
          });
    },
    getMsg(type) {
      if (Array.isArray(type)) {
        return type.length > 1
            ? `To create first set your active ${type[0]} group and active ${type[1]} group`
            : "";
      } else {
        return `To create first set your active ${type} group`;
      }
    },
    filters(relation) {
      const parentKeyValuePair = this.parentKeyValuePair(relation)

      return {
        [parentKeyValuePair.parentFKey]: parentKeyValuePair.parentFVal,
      };
    },
    fetchData() {
      this.loading = true
      this.model
          .FetchById(
              this.id,
              this.relationships,
              { flags: {}, moreHeaders: {}, rels: [] }
          )
          .then((response) => {

            this.item = response.response.data.data
            this.loading = false
            this.initialLoadHappened = true;
            this.$emit("initialLoadHappened", true);
          })
          .catch(() => {
            this.loading = false
            this.initialLoadHappened = true;
            this.$emit("initialLoadHappened", true);
          });
    },
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    activeTab(newVal) {
      this.$nextTick(() => {
        if (this.$refs[newVal]) {
          this.$refs[newVal][0].fetchData();
        }
      });
    },
    item(newVal) {
      if (Object.keys(newVal).length !== 0){
        this.$emit('update:item', newVal)
      }
    },
  }
};
</script>

<style scoped></style>
