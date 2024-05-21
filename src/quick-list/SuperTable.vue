<template>
    <div>
        <div v-if="canEdit" class="d-flex align-center mb-4 gap-1em">
            <template v-if="!!$slots.create">
                <slot name="create" />
            </template>
            <template v-else>
                <CreateButton
                    :modelFields="modelFields"
                    @createItem="createItem"
                    :model="model"
                    :superOptions="{
                        headers: headers,
                        modelFields: modelFields,
                        displayMapField: displayMapField,
                        model: model,
                        canEdit: canEdit,
                        currentParentRel: currentParentRel,
                        user: user,
                    }"
                />
            </template>
        </div>
        <template v-if="isForSelectingRelation">
            <SuperTableList
                :items="items"
                :modelValue="modelValue"
                @update:modelValue="clickRow"
                :superOptions="{
                    headers: headers,
                    modelFields: modelFields,
                    displayMapField: displayMapField,
                    model: model,
                    canEdit: canEdit,
                    currentParentRel: currentParentRel,
                    user: user,
                }"
            />
        </template>
        <template v-else>

            <DestructableExpansionPanels
                :destroy="!quickListsIsMobile"
                title="Settings"
            >
                <div class="d-flex align-center flex-wrap">
                    <v-select
                        style="width: 250px"
                        :items="[
                            { text: 'Table', value: 'table' },
                            { text: 'Grid', value: 'grid' },
                            { text: 'Map', value: 'map' },
                            { text: 'Calendar', value: 'calendar' },
                        ]"
                        v-model="activeTab"
                        variant="outlined"
                        label="View As"
                        item-title="text"
                        item-value="value"
                        density="compact"
                        class="ma-2 flex-grow-1 is-flex"
                        :menu-props="{ offsetY: true }"
                    />
                    <div
                        class="ma-2 flex-grow-1 is-flex"
                        v-for="filterInput of filterInputs"
                        :key="filterInput.name"
                    >
                        <template
                            v-if="
                                typeof filters[filterInput.name] !== 'undefined'
                            "
                        >
                            <template
                                v-if="
                                    filterInput.usageType.startsWith(
                                        'relForeignKey'
                                    )
                                "
                            >
                                <SuperSelect
                                    allowAll
                                    :key="filterInput.name"
                                    :modelField="filterInput"
                                    v-model="filters[filterInput.name]"
                                    :model="filterInput.meta.relatedModel"
                                    class="ma-2 flex-grow-1 is-flex"
                                    variant="outlined"
                                    density="compact"
                                    :user="user"
                                />
                            </template>
                            <template
                                v-if="filterInput.usageType == 'timeRangeStart'"
                            >
                                <FilterTime
                                    :key="filterInput.name"
                                    :modelField="filterInput"
                                    v-model="filters[filterInput.name].value"
                                    class="ma-2 flex-grow-1 is-flex"
                                />
                            </template>
                        </template>
                        <template v-else>
                            <template
                                v-if="filterInput.usageType == 'mapFilter'"
                            >
                                <FilterPlace
                                    :key="filterInput.name"
                                    :filterField="filterInput"
                                    v-model="filters"
                                    class="ma-2 flex-grow-1 is-flex"
                                    :user="user"
                                />
                            </template>
                        </template>
                        <!--                    </div>-->
                    </div>
                </div>
            </DestructableExpansionPanels>

            <div class="my-4">
                <template v-if="activeTab == 'table'">

                    <SuperTableTable
                        @updateOptions="updateOptions"
                        :items="items"
                        @clickRow="clickRow"
                        :pagination="pagination"
                        :superOptions="{
                            headers: headers,
                            modelFields: modelFields,
                            displayMapField: displayMapField,
                            model: model,
                            canEdit: canEdit,
                            currentParentRel: currentParentRel,
                            user: user,
                        }"
                    />
                </template>
                <template v-if="activeTab == 'grid'">
                    <div class="my-4">
                        <SuperTableGrid
                            :items="items"
                            @clickRow="clickRow"
                            :superOptions="{
                                headers: headers,
                                modelFields: modelFields,
                                displayMapField: displayMapField,
                                model: model,
                                canEdit: canEdit,
                                currentParentRel: currentParentRel,
                                user: user,
                            }"
                        />
                    </div>
                </template>
                <template v-if="activeTab == 'map'">
                    <SuperTableMap
                        :mapHeaders="mapHeaders"
                        :items="items"
                        @clickRow="clickRow"
                        :superOptions="{
                            headers: headers,
                            modelFields: modelFields,
                            displayMapField: displayMapField,
                            model: model,
                            canEdit: canEdit,
                            currentParentRel: currentParentRel,
                            user: user,
                        }"
                    />
                </template>
                <template v-if="activeTab == 'calendar'">
                    <SuperTableCalendar
                        :items="items"
                        @clickRow="clickRow"
                        :superOptions="{
                            headers: headers,
                            modelFields: modelFields,
                            displayMapField: displayMapField,
                            model: model,
                            canEdit: canEdit,
                            currentParentRel: currentParentRel,
                            user: user,
                        }"
                    />
                </template>
            </div>
        </template>

        <template v-if="canEdit">
            <v-dialog v-model="createItemData.showModal" max-width="800px">
                <CreateEditForm
                    title="Create Item"
                    v-if="createItemData.showModal"
                    v-model="createItemData.data"
                    @submit="createItemSubmit"
                    @cancel="createItemData.showModal = false"
                    :superOptions="{
                        headers: headers,
                        modelFields: modelFields,
                        displayMapField: displayMapField,
                        model: model,
                        canEdit: canEdit,
                        currentParentRel: currentParentRel,
                        user: user,
                    }"
                />
            </v-dialog>
        </template>
    </div>
</template>

<script>
import moment from 'moment-timezone'
import CreateEditForm from './CreateEditForm.vue'
import QuickListsHelpers from './QuickListsHelpers'
import SuperTableCalendar from './SuperTableCalendar.vue'
import SuperTableGrid from './SuperTableGrid.vue'
import SuperTableTable from './SuperTableTable.vue'
import SuperTableMap from './SuperTableMap.vue'
import SuperTableList from './SuperTableList.vue'
import SuperSelect from './SuperSelect.vue'
import FilterTime from './FilterTime.vue'
import FilterPlace from './FilterPlace.vue'
import DestructableExpansionPanels from './DestructableExpansionPanels.vue'
import CreateButton from './CreateButton.vue'

export default {
    name: 'SuperTable',
    components: {
        CreateButton,
        DestructableExpansionPanels,
        FilterPlace,
        FilterTime,
        SuperSelect,
        SuperTableList,
        SuperTableMap,
        SuperTableTable,
        SuperTableGrid,
        SuperTableCalendar,
        CreateEditForm,
    },
    props: {
        forcedFilters: {
            type: Object,
            default() {
                return {}
            },
        },
        user: {
            type: Object,
            default() {
              return {}
            },
        },
        model: {
            type: [Object, Function],
            required: true,
        },
        displayMapField: {
            type: Boolean,
            default() {
                return false
            },
        },
        isForSelectingRelation: {
            type: Boolean,
            default() {
                return false
            },
        },
        modelValue: {
            type: [Number, Object],
            default() {
                return null
            },
        },
        showMap: {
            type: Boolean,
            default() {
                return false
            },
        },
        canEdit: {
            type: Boolean,
            default() {
                return false
            },
        },
        currentParentRel: {
            type: Object,
            default() {
                return null
            },
        },
        defaultViewModeProp: {
            type: String,
            default() {
                return ''
            },
        },
    },
    data() {
        return {
            years: Array.from(
                { length: 5 },
                (_, index) => new Date().getFullYear() - index
            ), // last 5 years including this year
            pagination: {
                page: 1,
                itemsPerPage: 15,
                totalItems: 0,
            },
            createItemData: {
                showModal: false,
                data: {},
            },
            highlightedRow: null,
            filters: {},
            activeTab: "table",
        }
    },
    computed: {
        excludedCols() {
            let result = []
            if (this.currentParentRel?.currentParentRecord) {
                result = [this.currentParentRel.currentParentRecord.foreignKeyToParentRecord]
            }
            return result
        },
        filtersComp() {
            const result = {
                ...this.filters,
                ...this.forcedFilters,
            }

            if (this.currentParentRel?.currentParentRecord && this.currentParentRel.currentParentRecord.item) {
                result[this.currentParentRel.currentParentRecord.foreignKeyToParentRecord] =
                    this.currentParentRel.currentParentRecord.item.id
            }
            return result
        },
        quickListsIsMobile() {
            return QuickListsHelpers.quickListsIsMobile()
        },
        filterInputs() {
            const data = this.modelFields

            const result = []
            for (const item of data) {
                if (
                    item.usageType.startsWith('relForeignKeyNormal') ||
                    item.usageType == 'timeRangeStart'
                ) {
                    result.push(item)
                } else if (
                    item.usageType == 'relForeignKeyMapExtraRelSublocality'
                ) {
                    const children = data.filter((item) =>
                        item.usageType.startsWith('relForeignKeyMapExtraRel')
                    )

                    result.push({
                        label: 'Place',
                        name: 'Place',
                        usageType: 'mapFilter',
                        dataType: 'normal',
                        children: children,
                    })
                }
            }
            return result
        },
        headers() {
            const result = QuickListsHelpers.SupaerTableHeaders(
                this.model,
                this.excludedCols,
                this.canEdit,
                this.displayMapField
            )
            return result
        },
        mapHeaders() {
            const result = QuickListsHelpers.SupaerTableHeaders(
                this.model,
                this.excludedCols,
                this.canEdit,
                true
            )
            return result
        },
        modelFields() {
            const result = QuickListsHelpers.computedAttrs(
                this.model,
                this.excludedCols
            )
            return result
        },
        items() {
            const result = this.model
                .query()
                .where((item) => {
                    return this.quickListsGetIfMatchesAllChecks(
                        item,
                        this.filtersComp
                    )
                })
                .withAll()
                .orderBy('id', 'desc')
                .get()
            return result
        },
    },
    methods: {
        quickListsGetIfMatchesAllChecks(item, filters) {
            return QuickListsHelpers.quickListsGetIfMatchesAllChecks(
                item,
                filters
            )
        },
        openRecord(e) {
            this.$emit('openRecord', e)
        },
        formatTimestamp(timestamp) {
            if (timestamp) {
                const timezone = 'Africa/Johannesburg' // replace with desired timezone
                const formattedDateInTimeZone = moment
                    .tz(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'UTC')
                    .tz(timezone)
                    .format('dddd, MMMM D, YYYY h:mm A')
                return formattedDateInTimeZone
            } else {
                return null
            }
        },
        createNewInstance() {
            return new this.model()
        },
        clickRow(item) {
            if (this.isForSelectingRelation) {
                this.highlightedRow = item.id
            }

            this.$emit('update:modelValue', item)
        },
        createItem() {
            this.createItemData.showModal = true
        },
        createItemSubmit() {
            let payload = QuickListsHelpers.preparePayload(
                this.createItemData.data,
                this.modelFields
            )

            delete payload.id

            const inititalItemLength = this.items.length
            this.model.Store(payload).then(() => {
                if (!inititalItemLength) {
                    this.fetchData()
                }
            })

            // After handling, reset formData (if needed)
            this.createItemData.data = {}

            // Close the dialog after submission
            this.createItemData.showModal = false
        },
        updateOptions(e) {
            this.pagination.page = e.page
            this.pagination.limit = e.itemsPerPage
            this.fetchData()
        },
        async fetchData() {
            let rules = []
            if (this.model.rules?.readables){
              rules = this.model.rules.readables(this.user)
            }
            const response = await this.model.FetchAll({
                page: this.pagination.page,
                limit: this.pagination.itemsPerPage,
                filters: this.filtersComp,
                flags: {
                    ...rules,
                    order: 'id.desc',
                },
                moreHeaders: {
                    Prefer: 'count=exact',
                },
                clearPrimaryModelOnly: false,
                relationships: [],
            })
            // let count = null
            let count = -1
            if (response?.response?.headers?.['content-range']) {
                const contentRange =
                    response?.response?.headers?.['content-range']
                count = contentRange.split('/')[1]
            }
            this.pagination.totalItems = count // Assuming your API returns a total count
        },
    },
    watch: {
        filters: {
            handler() {
                this.fetchData()
            },
            deep: true,
        },
        'createItemData.showModal'(arg) {
            if (arg) {
                this.createItemData.data = this.createNewInstance()


                if (this.currentParentRel?.currentParentRecord) {
                    this.createItemData.data[
                        this.currentParentRel.currentParentRecord.foreignKeyToParentRecord
                    ] = this.currentParentRel.currentParentRecord.item.id
                }
            }
        },
    },

    mounted() {




        if (this.quickListsIsMobile) {
          this.activeTab = 'grid'
        } else if (this.defaultViewModeProp !== '') {
          this.activeTab = this.defaultViewModeProp
        } else if (this.model?.displayMapFull?.defaultViewMode) {
          this.activeTab = this.model.displayMapFull.defaultViewMode
        }

        for (const modelField of this.modelFields) {
            if (
                modelField.usageType.startsWith('relForeignKey') ||
                modelField.dataType.startsWith('mapExtraRel')
            ) {
                // this.$set(this.filters, modelField.name, null)
                this.filters[modelField.name] = null;

            } else if (modelField.usageType == 'timeRangeStart') {
                // this.$set(this.filters, modelField.name, {
                //     value: null,
                //     usageType: 'timeRangeStart',
                // })
                this.filters[modelField.name] = {
                  value: null,
                  usageType: 'timeRangeStart',
                };
            }
        }
        this.fetchData()
    },
}
</script>

<style>
.highlighted {
    background-color: #f0f0f0;
}
</style>