import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../main';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.VERSIONS);

export const DISCOVER_VERSIONS = createActionTypes(PREFIX + 'DISCOVER_VERSIONS');
export const CHANGE_VERSION_FILTER = PREFIX + 'CHANGE_VERSION_FILTER';
export const CHANGE_ADDRESS_FILTER = PREFIX + 'CHANGE_ADDRESS_FILTER';
export const CHANGE_TYPE_FILTER = PREFIX + 'CHANGE_TYPE_FILTER';
export const SORT_SUMMARY_TABLE = PREFIX + 'SORT_SUMMARY_TABLE';
export const SORT_DETAILED_TABLE = PREFIX + 'SORT_DETAILED_TABLE';

export const COMPONENTS_VERSIONS_DETAILED_TABLE_ID = 'components/versions/detailed';
export const COMPONENTS_VERSIONS_SUMMARY_TABLE_ID = 'components/versions/summary';
export const POLLING_INTERVAL = 120 * 1000;
export const DEBOUNCE_TIME = 700;

export const typeToReadable = {
    controller_agents: 'Controller agents',
    primary_masters: 'Primary masters',
    secondary_masters: 'Secondary masters',
    masters: 'Masters',
    http_proxies: 'HTTP proxies',
    rpc_proxies: 'RPC proxies',
    proxies: 'HTTP proxies',
    schedulers: 'Schedulers',
    nodes: 'Nodes',
    errors: 'Errors',
    default: 'Unknown',
};

export const pluralToSingular = {
    [typeToReadable.controller_agents]: 'Controller agent',
    [typeToReadable.primary_masters]: 'Primary master',
    [typeToReadable.secondary_masters]: 'Secondary master',
    [typeToReadable.masters]: 'Master',
    [typeToReadable.http_proxies]: 'HTTP proxy',
    [typeToReadable.rpc_proxies]: 'RPC proxy',
    [typeToReadable.proxies]: 'HTTP proxy',
    [typeToReadable.schedulers]: 'Scheduler',
    [typeToReadable.nodes]: 'Node',
    [typeToReadable.errors]: 'Error',
    [typeToReadable.default]: 'Unknown',
};
