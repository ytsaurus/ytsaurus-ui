import {SCHEMA_UPDATE_FILTER} from '../../../../constants/navigation/tabs/schema';

export function updateSchemaFilter(column) {
    return {
        type: SCHEMA_UPDATE_FILTER,
        data: {column},
    };
}
