import {COMPONENTS_VERSIONS_DETAILED_TABLE_ID} from '../../../../constants/components/versions/versions_v2';
import {
    changeHostFilter,
    changeTypeFilter,
    changeVersionFilter,
} from '../../../../store/actions/components/versions/versions_v2';
import {getWindowStore} from '../../../../store/window-store';
import {showErrorPopup} from '../../../../utils/utils';

export const tableProps = {
    css: 'components-versions',
    theme: 'light',
    striped: false,
    cssHover: true,
    templates: {
        key: 'components/versions',
        data: {
            showError: showErrorPopup,
            handleItemClick(item, column) {
                switch (column) {
                    case 'address':
                        getWindowStore().dispatch(changeHostFilter(item));
                        break;
                    case 'version':
                        getWindowStore().dispatch(changeVersionFilter([item]));
                        break;
                    case 'type':
                        getWindowStore().dispatch(changeTypeFilter([item]));
                        break;
                }
            },
        },
    },
    columns: {
        items: {
            address: {
                get(item) {
                    return item.address.match(/[^/]+(?=:)/g)[0];
                },
                align: 'left',
                sort: true,
                caption: 'Host',
            },
            version: {
                get(item) {
                    return item.version;
                },
                align: 'left',
                sort: true,
                caption: 'Version',
            },
            state: {
                get(item) {
                    return item.state;
                },
                align: 'left',
                sort: true,
                caption: 'State',
            },
            banned: {
                get(item) {
                    return item.banned;
                },
                align: 'center',
                sort: true,
                caption: 'B',
                tooltipProps: {placement: 'bottom', content: 'Banned'},
            },
            type: {
                get(item) {
                    return item.type;
                },
                align: 'left',
                sort: true,
                caption: 'Type',
            },
            error: {
                get(item) {
                    return item.error;
                },
                align: 'center',
                sort: true,
                caption: 'Error',
            },
            start_time: {
                get(item) {
                    return item.start_time;
                },
                align: 'right',
                sort: true,
                caption: 'Start time',
            },
        },
        sets: {
            detailed: {
                items: ['address', 'version', 'state', 'banned', 'type', 'error', 'start_time'],
            },
        },
    },
};

export const detailsTableProps = {
    ...tableProps,
    tableId: COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
    columns: {
        ...tableProps.columns,
        mode: 'detailed',
    },
};
