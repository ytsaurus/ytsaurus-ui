import {aclFiltersParams} from '../acl/url-mapping';
import {initialState as schedulingInitialState} from './scheduling';

import {
    makeObjectParseSerialize,
    parseSerializeNumber,
    parseSerializeString,
} from '../../../utils/parse-serialize';

import {parseSortStateArray, serializeSortStateArray} from '../../../utils/url-mapping';

import {LocationParameters} from '../../../store/location';
import {prometheusDashboardParams} from '../prometheusDashboard/url-mapping';

export const schedulingParams = {
    pool: {
        stateKey: 'scheduling.scheduling.pool',
        initialState: '<Root>',
    },
    tree: {
        stateKey: 'scheduling.scheduling.tree',
        initialState: schedulingInitialState.tree,
    },
};

export const schedulingOverviewParams = {
    ...schedulingParams,
    sort: {
        stateKey: 'scheduling.scheduling.sortState',
        initialState: schedulingInitialState.sortState,
        options: {
            parse: parseSortStateArray,
            serialize: serializeSortStateArray,
        },
    },
    showAbs: {
        stateKey: 'scheduling.scheduling.showAbsResources',
        initialState: schedulingInitialState.showAbsResources,
        type: 'bool',
    },
    contentMode: {
        stateKey: 'scheduling.scheduling.contentMode',
        initialState: schedulingInitialState.contentMode,
    },
    abc: {
        stateKey: 'scheduling.scheduling.abcServiceFilter',
        initialState: schedulingInitialState.abcServiceFilter,
        type: 'object',
        options: makeObjectParseSerialize(schedulingInitialState.abcServiceFilter, {
            slug: parseSerializeString,
            id: parseSerializeNumber,
        }),
    },
    operation_ref: {
        stateKey: 'scheduling.scheduling.operationRefId',
        initialState: schedulingInitialState.operationRefId,
    },
};

export const schedulingAclParams = {
    ...schedulingParams,
    ...aclFiltersParams,
};

export const schedulingMonitoringParams: LocationParameters = {
    ...schedulingParams,
    ...prometheusDashboardParams,
};
