import {createSelector} from 'reselect';
import reduce_ from 'lodash/reduce';
import forEach_ from 'lodash/forEach';

import {type RootState} from '../../reducers';
import {selectSchedulingPoolsMapByName} from './scheduling-pools';

export const selectSchedulingAbcFilter = (state: RootState) =>
    state.scheduling.scheduling.abcServiceFilter;

export const selectSchedulingOperationRefId = (state: RootState) =>
    state.scheduling.scheduling.operationRefId;

export const selectSchedulingAttributesToFilter = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilter;
export const selectSchedulingAttributesToFilterParams = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilterParams;

export const selectSchedulingOverviewHasFilter = (state: RootState) => {
    const abcFilter = selectSchedulingAbcFilter(state);

    return abcFilter?.id !== undefined;
};

export const selectSchedulingFilteredPoolNames = createSelector(
    [selectSchedulingAttributesToFilter, selectSchedulingPoolsMapByName, selectSchedulingAbcFilter],
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
