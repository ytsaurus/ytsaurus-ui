import {createSelector} from 'reselect';
import reduce_ from 'lodash/reduce';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../reducers';
import {getSchedulingPoolsMapByName} from './scheduling-pools';

export const getSchedulingAbcFilter = (state: RootState) =>
    state.scheduling.scheduling.abcServiceFilter;

export const getOperationRefId = (state: RootState) => state.scheduling.scheduling.operationRefId;

export const getSchedulingAttributesToFilter = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilter;
export const getSchedulingAttributesToFilterParams = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilterParams;

export const schedulingOverviewHasFilter = (state: RootState) => {
    const abcFilter = getSchedulingAbcFilter(state);

    return abcFilter?.id !== undefined;
};

export const getSchedulingFilteredPoolNames = createSelector(
    [getSchedulingAttributesToFilter, getSchedulingPoolsMapByName, getSchedulingAbcFilter],
    (attrsToFilter, loadedPools, abcFilter) => {
        if (!attrsToFilter) {
            return undefined;
        }

        if (abcFilter?.id === undefined) {
            return undefined;
        }

        const res = reduce_(
            attrsToFilter,
            (acc, attrs, key) => {
                if (attrs.abc?.id !== abcFilter?.id) {
                    return acc;
                }

                acc.add(key);
                return acc;
            },
            new Set<string>(),
        );

        forEach_([...res], (poolName) => {
            let name = poolName;
            let item = attrsToFilter[name];
            while (item?.parent && !loadedPools[name]) {
                res.add(item.parent);

                name = item.parent;
                item = attrsToFilter[item.parent];
            }
        });

        return res;
    },
);
