<template>
  <q-calendar-agenda
      ref="calendar"
      :model-value="modelValue"
      @update:modelValue="(e) => $emit('update:modelValue', e)"
      :view="view"
      :weekdays="[1, 2, 3, 4, 5, 6, 0]"
      short-weekday-label
      :date-header="'stacked'"
      :weekday-align="'center'"
      :date-align="'center'"
      bordered
      :interval-height="40"
      :interval-start="5"
      :interval-count="19"
      hour24-format
  >
    <template #head-day="{ scope }">
      <div class="text-center">
        <div class="text-weight-bold q-mt-xs">
          {{ momentMethod(scope.timestamp.date, "ddd") }}
        </div>
        <q-btn
            flat
            rounded
            dense
            :style="
            isToday(scope.timestamp.date)
              ? 'border: solid 2px var(--q-primary);'
              : 'border: solid 2px rgba(0,0,0,0);'
          "
            style="font-size: 0.75em"
            :label="
            momentMethod(scope.timestamp.date, 'D') +
            ' ' +
            momentMethod(scope.timestamp.date, 'MMM')
          "
            @click="onClickDate(scope.timestamp.date)"
            class="q-mb-sm text-bold"
        />
      </div>
    </template>

    <template #day="{ scope: { timestamp } }">
      <template v-if="!getEvents(timestamp.date).length">
        <div class="text-center q-pa-md text-grey-5">Empty</div>
      </template>
      <template v-for="event in getEvents(timestamp.date)" :key="event.id">
        <q-card class="q-pa-none q-ma-sm" @click="showEvent(event)">
          <template v-if="getCurrentTemplate(event.configForeignKey)?.cols">
            <RecordFieldsForDisplayCustom
                :item="event.meta"
                :maxFields="6"
                :childRelations="[]"
                isSummary
                :superOptions="getCurrentSuperOptions(event.configForeignKey)"
                :template="getCurrentTemplate(event.configForeignKey)"
                @editItem="editItem"
                @deleteItem="deleteItem"
                :unClickable="getCurrentUnClickable(event.configForeignKey)"
            />
          </template>
          <template v-else>
            <RecordFieldsForDisplayGeneric
                :item="event.meta"
                :maxFields="6"
                :superOptions="getCurrentSuperOptions(event.configForeignKey)"
                @editItem="editItem"
                @deleteItem="deleteItem"
                :unClickable="getCurrentUnClickable(event.configForeignKey)"
            />
          </template>
        </q-card>
      </template>
    </template>
  </q-calendar-agenda>
</template>

<script>
import moment from "moment";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";

export default {
  components: {
    RecordFieldsForDisplayGeneric,
    RecordFieldsForDisplayCustom,
  },
  props: {
    events: Array, // Now expecting an array of combined events
    modelValue: String,
    view: String,
    mixedConfigs: Array, // Config array for dynamic behavior
  },
  methods: {
    moveToToday() {
      this.$refs.calendar.moveToToday();
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    momentMethod(e, format) {
      return moment(e).format(format);
    },
    isToday(date) {
      return moment(date).isSame(moment(), "day");
    },
    getEvents(date) {
      // Return all events for the specific date or an empty array if none exist
      return this.events.filter((event) => event.date === date);
    },
    showEvent(event) {
      this.$emit("show-event", event);
    },
    editItem(item) {
      const config = this.getCurrentConfig(item.configForeignKey);
      config.events.editItem(item);
    },
    deleteItem(item) {
      const config = this.getCurrentConfig(item.configForeignKey);
      config.events.deleteItem(item);
    },
    getCurrentConfig(configForeignKey) {
      return this.mixedConfigs[configForeignKey];
    },
    getCurrentTemplate(configForeignKey) {
      const config = this.getCurrentConfig(configForeignKey);
      return config.templateListCalendar || {};
    },
    getCurrentSuperOptions(configForeignKey) {
      const config = this.getCurrentConfig(configForeignKey);
      return config.superOptions || {};
    },
    getCurrentUnClickable(configForeignKey) {
      const config = this.getCurrentConfig(configForeignKey);
      return config.unClickable || false;
    },
  },
};
</script>
