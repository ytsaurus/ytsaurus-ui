import {
    CHANGE_COLUMN_SORT_ORDER,
    CLUSTER_MENU_TABLE_ID,
    SYSTEM_CHUNKS_TABLE_ID,
    TOGGLE_COLUMN_SORT_ORDER,
} from '../../constants/tables';
import {ACCOUNTS_TABLE_ID} from '../../constants/accounts/accounts';
import {
    COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
    COMPONENTS_VERSIONS_SUMMARY_TABLE_ID,
} from '../../constants/components/versions/versions_v2';
import {OPERATION_JOBS_TABLE_ID} from '../../constants/operations/jobs';
import {
    COMPONENTS_NODES_NODE_TABLE_ID,
    COMPONENTS_NODES_TABLE_ID,
} from '../../constants/components/nodes/nodes';
import {COMPONENTS_PROXIES_TABLE_ID} from '../../constants/components/proxies/proxies';
import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../constants/navigation';
import {NAVIGATION_TABLETS_TABLE_ID} from '../../constants/navigation/tabs/tablets';
import {NAVIGATION_TRANSACTION_MAP_TABLE_ID} from '../../constants/navigation/content/transaction-map';
import {TABLET_PARTITIONS_TABLE_ID, TABLET_PARTITION_STORES_TABLE_ID} from '../../constants/tablet';
import {
    SCHEDULING_POOL_CHILDREN_TABLE_ID,
    SCHEDULING_POOL_TREE_TABLE_ID,
} from '../../constants/scheduling';

const NAME_ASC_SORT_VALUE = {field: 'name', asc: true};

export const initialState = {
    [CLUSTER_MENU_TABLE_ID]: NAME_ASC_SORT_VALUE,

    [SYSTEM_CHUNKS_TABLE_ID]: {field: 'cell_tag', asc: true},

    [NAVIGATION_MAP_NODE_TABLE_ID]: NAME_ASC_SORT_VALUE,
    [NAVIGATION_TABLETS_TABLE_ID]: {field: 'index', asc: true},
    [NAVIGATION_TRANSACTION_MAP_TABLE_ID]: {field: 'id', asc: true},

    [TABLET_PARTITIONS_TABLE_ID]: {field: 'index', asc: true},
    [TABLET_PARTITION_STORES_TABLE_ID]: {field: 'store_state', asc: true},

    [ACCOUNTS_TABLE_ID]: NAME_ASC_SORT_VALUE,

    [OPERATION_JOBS_TABLE_ID]: {field: 'start_time', asc: true},

    [COMPONENTS_VERSIONS_SUMMARY_TABLE_ID]: {field: 'version', asc: true},
    [COMPONENTS_VERSIONS_DETAILED_TABLE_ID]: {field: 'address', asc: true},

    [COMPONENTS_NODES_TABLE_ID]: {field: 'host', asc: true},
    [COMPONENTS_NODES_NODE_TABLE_ID]: {field: 'cell_id', asc: true},

    [COMPONENTS_PROXIES_TABLE_ID]: {field: 'host', asc: true},

    [SCHEDULING_POOL_TREE_TABLE_ID]: NAME_ASC_SORT_VALUE,
    [SCHEDULING_POOL_CHILDREN_TABLE_ID]: NAME_ASC_SORT_VALUE,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_COLUMN_SORT_ORDER: {
            const {tableId, sortInfo} = action.data;
            return {...state, [tableId]: sortInfo};
        }
        case CHANGE_COLUMN_SORT_ORDER: {
            const {tableId, columnName: field, asc} = action.data;

            return {
                ...state,
                [tableId]: {field, asc},
            };
        }

        default:
            return state;
    }
};
