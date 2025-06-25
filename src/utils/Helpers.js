class Helpers {

    static snakeToTitle(string) {
        return string
            .split('_')
            .map(
                (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(' ')
    }

    static getIfMatchesAllChecks(item, filters) {
        for (const [key, filter] of Object.entries(filters)) {
            // todo: note the below logic was to support time range filters
            if (
                typeof filter === 'object' &&
                !Array.isArray(filter) &&
                filter !== null
            ) {
                if (filter) {
                    if (filter.usageType === 'timeRangeStart') {
                        if (filter.range.start) {
                            const startDate = new Date(filter.range.start)
                            const endDate = new Date(filter.range.end)
                            const itemDate = new Date(item[key])
                            return startDate < itemDate && itemDate < endDate
                        }
                    }
                }
            } else if (filter !== null) {
                return item[key] == filter
            }
        }

        return true
    }

    static prepareFiltersForSupabase(obj) {
        let result = []
        for (const [key, filter] of Object.entries(obj)) {
            // todo: note the below logic was to support time range filters
            if (
                typeof filter === 'object' &&
                !Array.isArray(filter) &&
                filter !== null
            ) {
                if (filter) {
                    if (filter.usageType === 'timeRangeStart') {
                        if (filter.range.start) {
                            result.push(
                                `${key}=gte.${filter.range.start}`
                            )
                            result.push(`${key}=lte.${filter.range.end}`)
                        }
                    }
                }
            } else if (filter !== null) {
                // result[key] = `eq.${item.value}`;
                result.push(`${key}=eq.${filter}`)
            }
        }
        // return result;
        return result.join('&')
    }

    static prepareFiltersForLaravel(obj) {
        const result = {};

        for (const [key, filter] of Object.entries(obj)) {
            if (typeof filter === 'object' && filter !== null ) {
                // Handle time range filters using gt/lt for start and end dates
                if (filter && filter.range) {
                    if (filter.range.start) {
                        result[`filter[${key}-ge]`] = filter.range.start; // Changed to 'ge' to match allowed filters
                    }
                    if (filter.range.end) {
                        result[`filter[${key}-le]`] = filter.range.end; // Changed to 'le' to match allowed filters
                    }
                }
            } else if (filter === 0) {
                // show all
            } else if (filter !== null) {
                // Handle simple equality filters
                result[`filter[${key}]`] = filter;
            }
        }

        return result;
    }

    static prepareFiltersForAirtable(obj) {
        let formulas = [];

        for (const [key, filter] of Object.entries(obj)) {
            if (typeof filter === 'object' && filter !== null ) {
                if (filter.range) {
                    if (filter.range.start) {
                        formulas.push(`AND(IS_AFTER({${key}}, '${filter.range.start}'), IS_BEFORE({${key}}, '${filter.range.end}'))`);
                    }
                }
            } else if (filter !== null) {
                formulas.push(`{${key}} = '${filter}'`);
            }
        }

        if (formulas.length === 0) {
            return {};
        }

        return {
            filterByFormula: formulas.length > 1 ? `AND(${formulas.join(", ")})` : formulas[0]
        };
    }



    static getFieldFromModelOrParent(fields, usageType) {
        let targetField = null;

        // Check direct fields for the usageType
        targetField = Object.values(fields).find(field => field.usageType === usageType);
        if (targetField) {
            // If found in direct fields, return the field name
            return targetField.field;
        }

        // If not found, check parent fields
        Object.values(fields).forEach(field => {
            if (field.headerParentFields) {
                const parentField = field.headerParentFields.find(parent => parent.usageType === usageType);
                if (parentField) {
                    // Return the nested field path
                    targetField = parentField.name;
                }
            }
        });

        return targetField; // Either the direct field name or the nested field path
    }





    static prepareRelationsForSupabase(arr) {
        let select = ['*']
        for (const value of arr) {
            select.push(`${value}(*)`)
        }

        // *,event_type_id(*),provider_that_owns_this_id(*),event_type:venue_country_id(*),venue_state_id(*),venue_substate_id(*),venue_town_id(*),venue_suburb_id(*)
        const result = select.join(',')

        return {
            select: result,
        }
    }
    static prepareRelationsForLaravel(arr) {
        let includes = [];
        for (const value of arr) {
            includes.push(value);
        }

        // Join the relations with commas
        const result = includes.join(',');

        return {
            include: result,
        };
    }

    static prepareRelationsForAirtable(arr) {
        return {}; // Airtable doesn't support relation expansion in the API directly
    }





    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

}

export default Helpers
