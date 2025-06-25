<template>
  <div>
    <template v-if="treeMode">
      <SuperRecordTreeModeParent
          :configsCollection="configsCollection"
          :allowedTabs="allowedTabs"
          :templateOverview="templateOverview"
          :templateForm="templateForm"
          :model="model"
          :id="id"
          :displayMapField="displayMapField"
          :relationships="relationships"
          @fetchData="fetchData"
          :update:item="$emit('update:item')"
          :item="item"
          :loading="loading"
          :canEdit="canEdit"
          :superOptions="superOptions"
      />
    </template>
    <template v-else>
      <SuperRecordTabMode
          :configsCollection="configsCollection"
          :allowedTabs="allowedTabs"
          :templateOverview="templateOverview"
          :templateForm="templateForm"
          :model="model"
          :id="id"
          :displayMapField="displayMapField"
          :relationships="relationships"
          @fetchData="fetchData"
          :update:item="$emit('update:item')"
          :item="item"
          :loading="loading"
          :canEdit="canEdit"
          :superOptions="superOptions"
      />
    </template>
  </div>
</template>

<script>
import SuperRecordTabMode from "./SuperRecordTabMode.vue";
import SuperRecordTreeModeParent from "./SuperRecordTreeModeParent.vue";
import CreateEditForm from "./CreateEditForm.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import OverviewTab from "./OverviewTab.vue";

export default {
  name: "SuperRecord",
  components: {
    OverviewTab,
    CreateEditForm,
    SuperRecordTreeModeParent,
    SuperRecordTabMode,
  },
  props: {
    configsCollection: {
      type: Object,
      default: {},
    },
    allowedTabs: {
      type: Array,
      default() {
        return [];
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
      type: [Number, String],
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
    treeMode: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data(){
    return {

      deleteItemData: {
        showModal: false,
        data: null,
      },
      editItemData: {
        showModal: false,
        data: null,
      },
      formServerErrors: {},
      loading: true,
      initialLoadHappened: false,
      item: {},
    }
  },
  computed: {

    modelFields() {
      return QuickListsHelpers.computedAttrs(this.model, []);
    },
    canEdit() {
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
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
  },
  methods: {


    fetchData() {
      this.loading = true
      this.model
          .FetchById(
              this.id,
              this.relationships,
              { flags: {}, moreHeaders: {}, rels: [] }
          )
          .then((response) => {

            if (this.model.adapter == "supabase") {
              this.item = response.response.data.data;
            } else if (this.model.adapter == "laravel") {
              this.item = response.response.data.data;
            } else if (this.model.adapter === "airtable") {
              this.item = {
                id: response.response.data.id,
                createdTime: response.response.data.createdTime,
                ...response.response.data.fields
              };
            }
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
    if(this.allowedTabs.length){
      this.activeTab = `tab-${this.allowedTabs[0]}`
    }
    this.fetchData();
  },
};
</script>

<style lang="scss">
</style>
