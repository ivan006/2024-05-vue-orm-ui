<template>
  <div style="max-height: 330px; overflow-y: scroll">
    <q-list dense>
      <q-item-label header :model-value="modelValue" color="primary">
        <q-item
            v-for="(item, i) in items"
            :key="i"
            :value="item.id"
            @click="clickRow(item)"
        >
          <q-item-section>
            <q-item-label>
              <DatapointForDisplayInner
                  :header="title"
                  :item="item"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
              />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-item-label>
    </q-list>
  </div>
</template>

<script>
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";

export default {
  name: "SuperTableList",
  components: {RecordFieldsForDisplayCustom, DatapointForDisplayInner },
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    modelValue: {
      type: Number,
      default: null,
    },
    superOptions: {
      type: Object,
      default() {
        return {
          headers: [],
          modelFields: [],
          displayMapField: false,
          model: {},
          canEdit: false,
          currentParentRecord: {},
        };
      },
    },
  },
  methods: {
    clickRow(item) {
      this.$emit("update:modelValue", item.id);
    },
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
  },
  computed: {
    title() {
      return this.superOptions.headers.find((header) => header.field !== "id");
    },
  },
};
</script>

<style scoped></style>
