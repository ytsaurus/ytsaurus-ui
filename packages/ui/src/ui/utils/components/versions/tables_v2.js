import {
    COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
    COMPONENTS_VERSIONS_SUMMARY_TABLE_ID,
} from '../../../constants/components/versions/versions_v2';
import {
    changeHostFilter,
    changeTypeFilter,
    changeVersionFilter,
} from '../../../store/actions/components/versions/versions_v2';
import {getWindowStore} from '../../../store/window-store';
import {showErrorPopup} from '../../../utils/utils';

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
            primary_masters: {
                get(item) {
                    return item.primary_master || 0;
                },
                align: 'right',
                sort: true,
                caption: 'Pri Masters',
                title: 'Primary  Masters',
            },
            secondary_masters: {
                get(item) {
                    return item.secondary_master || 0;
                },
                align: 'right',
                sort: true,
                caption: 'Sec Masters',
                title: 'Secondary Masters',
            },
            schedulers: {
                get(item) {
                    return item.scheduler || 0;
                },
                align: 'right',
                sort: true,
                caption: 'Schedulers',
            },
            controller_agents: {
                get(item) {
                    return item.controller_agent || 0;
                },
                align: 'right',
                sort: true,
                caption: 'CA',
                title: 'Control Agents',
            },
            nodes: {
                get(item) {
                    return item.node || 0;
                },
                align: 'right',
                sort: true,
                caption: 'Nodes',
            },
            http_proxies: {
                get(item) {
                    return item.http_proxy || 0;
                },
                align: 'right',
                sort: true,
                caption: 'HTTP Proxies',
            },
            rpc_proxies: {
                get(item) {
                    return item.rpc_proxy || 0;
                },
                align: 'right',
                sort: true,
                caption: 'RPC Proxies',
            },
            online_count: {
                get(item) {
                    return item.online;
                },
                align: 'right',
                sort: true,
                caption: 'Online',
            },
            offline_count: {
                get(item) {
                    return item.offline;
                },
                align: 'right',
                sort: true,
                caption: 'Offline',
            },
            banned_count: {
                get(item) {
                    return item.banned;
                },
                align: 'right',
                sort: true,
                caption: 'Banned',
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
            summary: {
                items: [
                    'version',
                    'primary_masters',
                    'secondary_masters',
                    'schedulers',
                    'controller_agents',
                    'nodes',
                    'http_proxies',
                    'rpc_proxies',
                    'online_count',
                    'offline_count',
                    'banned_count',
                ],
            },
            detailed: {
                items: ['address', 'version', 'state', 'banned', 'type', 'error', 'start_time'],
            },
        },
    },
};

export const summaryTableProps = {
    ...tableProps,
    css: 'components-versions-summary',
    tableId: COMPONENTS_VERSIONS_SUMMARY_TABLE_ID,
    columns: {
        ...tableProps.columns,
        mode: 'summary',
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
