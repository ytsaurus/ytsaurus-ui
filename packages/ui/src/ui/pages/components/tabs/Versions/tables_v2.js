import {COMPONENTS_VERSIONS_DETAILED_TABLE_ID} from '../../../../constants/components/versions/versions_v2';
import {
    changeHostFilter,
    changeTypeFilter,
    changeVersionFilter,
} from '../../../../store/actions/components/versions/versions_v2';
import {getWindowStore} from '../../../../store/window-store';
import {showErrorPopup} from '../../../../utils/utils';
import i18n from './i18n';

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
                get caption() {
                    return i18n('field_host');
                },
            },
            version: {
                get(item) {
                    return item.version;
                },
                align: 'left',
                sort: true,
                get caption() {
                    return i18n('field_version-header');
                },
            },
            state: {
                get(item) {
                    return item.state;
                },
                align: 'left',
                sort: true,
                get caption() {
                    return i18n('field_state-header');
                },
            },
            banned: {
                get(item) {
                    return item.banned;
                },
                align: 'center',
                sort: true,
                get caption() {
                    return i18n('field_banned-abbr');
                },
                get tooltipProps() {
                    return {placement: 'bottom', content: i18n('context_banned-tooltip')};
                },
            },
            type: {
                get(item) {
                    return item.type;
                },
                align: 'left',
                sort: true,
                get caption() {
                    return i18n('field_type-header');
                },
            },
            error: {
                get(item) {
                    return item.error;
                },
                align: 'center',
                sort: true,
                get caption() {
                    return i18n('field_error');
                },
            },
            start_time: {
                get(item) {
                    return item.start_time;
                },
                align: 'right',
                sort: true,
                get caption() {
                    return i18n('field_start-time');
                },
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
