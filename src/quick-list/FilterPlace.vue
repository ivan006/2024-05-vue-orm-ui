<template>
  <div>
    <q-input
        label="Place Filter"
        type="text"
        v-model="displayPlace"
        :error="false"
        :error-message="''"
        disable
        filled
        dense
        placeholder="All"
        class="FilterPlaceTrigger"
    />
    <q-menu
        v-model="menu"
        fit
        class="q-pt-none"
        no-corner
    >
      <q-card>
        <q-card-section>
          <template
              v-for="childFilter in filterField.children"
              :key="childFilter.name"
          >
            <template
                v-if="childFilter.usageType.startsWith('relForeignKeyMapExtraRel')"
            >
              <div class="q-mt-md">
                <SuperTable

                    allowAll
                    v-if="typeof filtersData[childFilter.name] !== 'undefined'"
                    :modelField="childFilter"
                    :model="childFilter.meta.field.parent"
                    :forcedFilters="getFilters(childFilter)"
                    v-model="filtersData[childFilter.name]"
                    :disabled="filterParentName(childFilter) && !modelValue[filterParentName(childFilter)]"
                    @update:modelValue="handleSelectChange(childFilter.name)"

                    :isForSelectingRelation="true"
                    hideCreate
                    selectHideBottomSpace
                />
                <!--:modelField="filtersData[childFilter.name]"-->

                <!--:hideLabel="hideLabel"-->
                <!--:isForSelectingRelation="true"-->
                <!--:canEdit="false"-->
                <!--:rules="[() => true]"-->
                <!--:fetchFlags="{-->
                <!--sort: field.meta.field.parent.titleKey-->
                <!--}"-->
                <!--@superTableMounted="$emit('superTableMounted')"-->
                <!--:errorMessage="compError"-->
                <!--disabled-->

                <!--<SuperSelect-->
                <!--    allowAll-->
                <!--    v-if="typeof filtersData[childFilter.name] !== 'undefined'"-->
                <!--    :modelField="childFilter"-->
                <!--    :model="childFilter.meta.field.parent"-->
                <!--    :filters="getFilters(childFilter)"-->
                <!--    v-model="filtersData[childFilter.name]"-->
                <!--    :disabled="filterParentName(childFilter) && !modelValue[filterParentName(childFilter)]"-->
                <!--    @update:modelValue="handleSelectChange(childFilter.name)"-->
                <!--/>-->
              </div>
            </template>
          </template>

          <q-btn color="primary" class="q-mt-md" @click="menu = false">OK</q-btn>
        </q-card-section>
      </q-card>
    </q-menu>
  </div>
</template>

<script>
import SuperSelect from "./SuperSelect.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import {defineAsyncComponent} from "vue";
import {FieldUsageTypes} from "../index";


const AsyncSuperTableComponent = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "FilterPlace",
  components: {
    SuperSelect,
    SuperTable: AsyncSuperTableComponent
  },
  props: {
    filterField: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      menu: false,
      filtersData: [],
      placeFieldLevelTypes: [
        "relForeignKeyMapExtraRelCountry",
        "relForeignKeyMapExtraRelAdminArea1",
        "relForeignKeyMapExtraRelAdminArea2",
        "relForeignKeyMapExtraRelLocality",
        "relForeignKeyMapExtraRelSublocality",
      ],
      parentRelationships: {
        relForeignKeyMapExtraRelCountry: null,
        relForeignKeyMapExtraRelAdminArea1: "relForeignKeyMapExtraRelCountry",
        relForeignKeyMapExtraRelAdminArea2: "relForeignKeyMapExtraRelAdminArea1",
        relForeignKeyMapExtraRelLocality: "relForeignKeyMapExtraRelAdminArea2",
        relForeignKeyMapExtraRelSublocality: "relForeignKeyMapExtraRelLocality",
      },
    };
  },
  computed: {
    displayPlace() {
      let displayText = "";
      const placeFields = this.filterField.children;

      for (let placeFieldLevelType of this.placeFieldLevelTypes) {
        let placeField = placeFields.find(
            (placeField) => placeField.usageType === placeFieldLevelType
        );

        if (
            placeField &&
            this.filtersData[placeField.name] &&
            this.filtersData[placeField.name]
        ) {
          let displayName = this.fetchDisplayNameFromVuex(
              placeField.meta.field.parent,
              this.filtersData[placeField.name]
          );
          if (displayName) {
            displayText = displayName;
          }
        }
      }

      return displayText;
    },
  },
  methods: {
    handleSelectChange(fieldName) {
      const changedField = this.filterField.children.find(
          (child) => child.name === fieldName
      );

      if (changedField) {
        const childTypes = this.getChildFields(changedField.usageType);
        for (let childType of childTypes) {
          const childField = this.filterField.children.find(
              (child) => child.usageType === childType
          );
          if (childField && this.filtersData[childField.name]) {
            this.filtersData[childField.name] = null;
          }
        }
      }
    },
    getChildFields(modelFieldType) {
      const index = this.placeFieldLevelTypes.indexOf(modelFieldType);
      if (index === -1 || index === this.placeFieldLevelTypes.length - 1) {
        return [];
      }
      return this.placeFieldLevelTypes.slice(index + 1);
    },
    fetchDisplayNameFromVuex(model, id) {
      let result = "PlaceholderName";
      const data = model.query().whereId(id).first();
      result = data[this.title(model).name];
      return result;
    },
    title(model) {
      const computedAttrs = QuickListsHelpers.computedAttrs(model);
      const result = computedAttrs.find((header) => header.name !== "id");
      return result;
    },
    filterParentName(modelField) {
      const parentType = this.parentRelationships[modelField.usageType];
      let filterParentName = null;
      if (parentType) {
        const parent = this.filterField.children.find(
            (field) => field.usageType == parentType
        );
        if (parent) {
          filterParentName = parent.name;
        }
      }
      return filterParentName;
    },
    getFilters(modelField) {
      const filterParentName = this.filterParentName(modelField);

      let currentType = ''
      if (modelField.usageType === 'relForeignKeyMapExtraRelAdminArea1'){
        currentType = FieldUsageTypes.mapExtraRelCountry()
      } else if (modelField.usageType === 'relForeignKeyMapExtraRelAdminArea2'){
        currentType = FieldUsageTypes.mapExtraRelAdminArea1()
      } else if (modelField.usageType === 'relForeignKeyMapExtraRelLocality'){
        currentType = FieldUsageTypes.mapExtraRelAdminArea2()
      } else if (modelField.usageType === 'relForeignKeyMapExtraRelSublocality'){
        currentType = FieldUsageTypes.mapExtraRelLocality()
      }

      const parentKey = Object.keys(modelField.meta.relatedModel.fieldsMetadata).find(
          (key) => modelField.meta.relatedModel.fieldsMetadata[key].usageType === currentType
      );

      let result = {}
      if (this.modelValue[filterParentName]){
        result[parentKey] = this.modelValue[filterParentName]
      }

      return result;
    },
  },
  watch: {
    filtersData: {
      handler(newVal) {
        this.$emit("update:modelValue", newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.filtersData = this.modelValue;
  },
};
</script>


<style>

.FilterPlaceTrigger > div {
  cursor: pointer !important;
}


.FilterPlaceTrigger.q-field--disabled .q-field__control > div {
  opacity: 1 !important;
}
</style>

