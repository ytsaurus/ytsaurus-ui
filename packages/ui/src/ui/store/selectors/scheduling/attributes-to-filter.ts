import {createSelector} from 'reselect';
import reduce_ from 'lodash/reduce';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../reducers';
import {getSchedulingPoolsMapByName} from './scheduling-pools';

export const getSchedulingFilter = (state: RootState) => state.scheduling.scheduling.filter;
export const getSchedulingAbcFilter = (state: RootState) =>
    state.scheduling.scheduling.abcServiceFilter;

export const getSchedulingAttributesToFilter = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilter;
export const getSchedulingAttributesToFilterTime = (state: RootState) =>
    state.scheduling.scheduling.attributesToFilterTime;

export const schedulingOverviewHasFilter = (state: RootState) => {
    const nameFilter = getSchedulingFilter(state);
    const abcFilter = getSchedulingAbcFilter(state);

    return hasOverviewFilter({nameFilter, abcId: abcFilter?.id});
};

function hasOverviewFilter(filter: {nameFilter?: string; abcId?: number}) {
    const {nameFilter, abcId} = filter;
    return Boolean(nameFilter) || abcId !== undefined;
}

export const getSchedulingFilteredPoolNames = createSelector(
    [
        getSchedulingAttributesToFilter,
        getSchedulingPoolsMapByName,
        getSchedulingFilter,
        getSchedulingAbcFilter,
    ],
    (attrsToFilter, loadedPools, nameFilter, abcFilter) => {
        if (!attrsToFilter) {
            return undefined;
        }

        if (!hasOverviewFilter({nameFilter, abcId: abcFilter?.id})) {
            return undefined;
        }

        const res = reduce_(
            attrsToFilter,
            (acc, attrs, key) => {
                if (hasOverviewFilter({nameFilter}) && -1 === key.indexOf(nameFilter)) {
                    return acc;
                }
                if (hasOverviewFilter({abcId: abcFilter?.id}) && attrs.abc?.id !== abcFilter?.id) {
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
