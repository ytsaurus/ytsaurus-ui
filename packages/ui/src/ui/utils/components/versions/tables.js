import {
    COMPONENTS_VERSIONS_SUMMARY_TABLE_ID,
    COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
} from '../../../constants/components/versions/versions';
import {
    changeVersionFilter,
    changeTypeFilter,
    changeAddressFilter,
} from '../../../store/actions/components/versions/versions';
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
                        window.store.dispatch(changeAddressFilter(item));
                        break;
                    case 'version':
                        window.store.dispatch(changeVersionFilter([item]));
                        break;
                    case 'type':
                        window.store.dispatch(changeTypeFilter([item]));
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
                caption: 'Address',
            },
            version: {
                get(item) {
                    return item.version;
                },
                align: 'left',
                sort: true,
                caption: 'Version',
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
                    return item.primary_masters;
                },
                align: 'right',
                sort: true,
                caption: 'Pri Masters',
            },
            secondary_masters: {
                get(item) {
                    return item.secondary_masters;
                },
                align: 'right',
                sort: true,
                caption: 'Sec Masters',
            },
            schedulers: {
                get(item) {
                    return item.schedulers;
                },
                align: 'right',
                sort: true,
                caption: 'Schedulers',
            },
            controller_agents: {
                get(item) {
                    return item.controller_agents;
                },
                align: 'right',
                sort: true,
                caption: 'Ctrl Agents',
            },
            nodes: {
                get(item) {
                    return item.nodes;
                },
                align: 'right',
                sort: true,
                caption: 'Nodes',
            },
            http_proxies: {
                get(item) {
                    return item.http_proxies;
                },
                align: 'right',
                sort: true,
                caption: 'HTTP Proxies',
            },
            rpc_proxies: {
                get(item) {
                    return item.rpc_proxies;
                },
                align: 'right',
                sort: true,
                caption: 'RPC Proxies',
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
                ],
            },
            detailed: {
                items: ['address', 'version', 'type', 'error', 'start_time'],
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

export const detailedTableProps = {
    ...tableProps,
    css: 'components-versions-detailed',
    tableId: COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
    columns: {
        ...tableProps.columns,
        mode: 'detailed',
    },
};
