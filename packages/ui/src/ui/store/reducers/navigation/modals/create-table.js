import {
    CREATE_TABLE_MODAL_DATA_FIELDS,
    SELECT_EMPTY_VALUE,
} from '../../../../constants/navigation/modals/create-table';

export function createNewColumn(id, dataType = 'bool') {
    const name = `Column_${id}`;
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
