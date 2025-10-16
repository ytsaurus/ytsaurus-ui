import {initialState as schedulingInitialState} from './scheduling';
import {aclFiltersParams} from '../acl/url-mapping';
import {
    makeObjectParseSerialize,
    parseSerializeNumber,
    parseSerializeString,
} from '../../../utils/parse-serialize';
import {parseSortStateArray, serializeSortStateArray} from '../../../utils/url-mapping';

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
        stateKey: 'scheduling.sortState',
        initialState: schedulingInitialState.sortState,
        options: {
            parse: parseSortStateArray,
            serialize: serializeSortStateArray,
        },
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

export const schedulingMonitorParams = {
    ...schedulingParams,
};

export const schedulingAclParams = {
    ...schedulingParams,
    ...aclFiltersParams,
};
