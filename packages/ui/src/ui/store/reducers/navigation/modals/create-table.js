import {
    CREATE_TABLE_MODAL_DATA_FIELDS,
    SELECT_EMPTY_VALUE,
} from '../../../../constants/navigation/modals/create-table';
import i18n from './i18n';

export function createNewColumn(id, dataType = 'bool') {
    const name = i18n('value_column-name', {id});
    return {
        id: String(id),
        name,
        dataType,
        optional: true,
        group: '',
        aggregate: SELECT_EMPTY_VALUE,
    };
}

export const initialState = {
    parentDirectory: '',
    showModal: false,

    columnsOrder: [],
    keyColumns: {},

    columnLockSuggestions: [],
    columnGroupSuggestions: [],
};

export default (state = initialState, {type, data}) => {
    switch (type) {
        case CREATE_TABLE_MODAL_DATA_FIELDS: {
            return {...state, ...data};
        }
        default:
            return state;
    }
};
