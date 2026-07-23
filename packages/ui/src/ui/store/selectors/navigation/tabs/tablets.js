import mapValues_ from 'lodash/mapValues';
import map_ from 'lodash/map';

import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {histogramItems, tableItems} from '../../../../utils/navigation/tabs/tables';
import {NAVIGATION_TABLETS_TABLE_ID} from '../../../../constants/navigation/tabs/tablets';
import {prepareAggregation, prepareDataForColumns} from '../../../../utils/navigation/tabs/tablets';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {findTabletByKey, isPivotFilter} from '../../../../utils/navigation/tabs/find-tablet-by-key';
import {selectAttributes} from '../index';
import ypath from '../../../../common/thor/ypath';

export const selectTabletsMode = (state) => state.navigation.tabs.tablets.tabletsMode;

const selectRawTablets = (state) => state.navigation.tabs.tablets.tablets;
const selectRawReplicationLagTimes = (state) => state.navigation.tabs.tablets.replicationLagTimes;

/** @returns { OldSortState } */
export const selectTabletsSortState = (state) => state.tables[NAVIGATION_TABLETS_TABLE_ID];
const selectTabletsFilter = (state) => state.navigation.tabs.tablets.tabletsFilter;
export const selectActiveHistogram = (state) => state.navigation.tabs.tablets.histogramType;

const selectMergedRawTablets = createSelector(
    [selectRawTablets, selectRawReplicationLagTimes],
    (rawTablets, rawReplicationLagTimes) => {
        if (!rawReplicationLagTimes || rawReplicationLagTimes.length === 0) {
            return rawTablets;
        }

        const replicationByTabletId = new Map();
        rawReplicationLagTimes.forEach((item) => {
            const tabletId = tableItems['tablet_id'].get(item);
            if (!tabletId) return;
            replicationByTabletId.set(tabletId, {
                replication_lag_time: tableItems['replication_lag_time'].get(item),
                replication_mode: tableItems['replication_mode'].get(item),
            });
        });

        if (replicationByTabletId.size === 0) {
            return rawTablets;
        }

        return rawTablets.map((tablet) => {
            const tabletId = tableItems['tablet_id'].get(tablet);
            const replicationFields = replicationByTabletId.get(tabletId);
            if (!replicationFields) return tablet;

            if (tablet && tablet.$value !== undefined) {
                return {
                    ...tablet,
                    $value: {...tablet.$value, ...replicationFields},
                };
            }
            return {...tablet, ...replicationFields};
        });
    },
);

const selectSortedTablets = createSelector(
    [selectMergedRawTablets, selectTabletsSortState],
    (rawTablets, sortState) => hammer.utils.sort(rawTablets, sortState, tableItems),
);

const selectFilteredTablets = createSelector(
    [selectMergedRawTablets, selectSortedTablets, selectTabletsFilter, selectAttributes],
    (rawTablets, sortedTablets, tabletsFilter, attributes) => {
        if (isPivotFilter(tabletsFilter)) {
            const schema = ypath.getValue(attributes, '/schema') || [];
            return findTabletByKey(tabletsFilter, rawTablets, schema);
        }

        return hammer.filter.filter({
            data: sortedTablets,
            input: tabletsFilter,
            factors: [
                function (item) {
                    return tableItems['tablet_id'].get(item);
                },
                function (item) {
                    return tableItems['cell_id'].get(item);
                },
                function (item) {
                    return tableItems['state'].get(item);
                },
                function (item) {
                    return tableItems['cell_leader_address'].get(item);
                },
                function (item) {
                    return tableItems['replication_lag_time']?.get?.(item);
                },
                function (item) {
                    return tableItems['replication_mode']?.get?.(item);
                },
            ],
        });
    },
);

export const selectPreparedDataForColumns = createSelector([selectFilteredTablets], (items) => {
    /** @type {Array<TabletInfo>} */
    const res = prepareDataForColumns(items);
    return res;
});

export const selectIsReplicationDataExist = createSelector(
    [selectRawReplicationLagTimes],
    (rawReplicationLagTimes) => {
        if (!rawReplicationLagTimes || rawReplicationLagTimes.length === 0) {
            return false;
        }
        return rawReplicationLagTimes.some(
            (item) =>
                item &&
                (tableItems['replication_lag_time']?.get?.(item) ||
                    Boolean(tableItems['replication_mode']?.get?.(item))),
        );
    },
);

export const selectTablets = createSelector(selectPreparedDataForColumns, (filteredTablets) => {
    const aggregation = prepareAggregation(filteredTablets);
    return [aggregation, ...filteredTablets];
});

const selectHistograms = createSelector(selectRawTablets, (tablets) => {
    return mapValues_(histogramItems, (histogramItem, key) => {
        const get = histogramItem.get || tableItems[key].get;

        return {
            ...histogramItem,
            data: map_(tablets, get),
            dataFormat: histogramItem.format,
            dataName: histogramItem.dataName || hammer.format['ReadableField'](key, {caps: 'none'}),
        };
    });
});

export const selectHistogram = createSelector(
    [selectHistograms, selectActiveHistogram],
    (histograms, activeHistogram) => histograms[activeHistogram],
);

export const selectNavigationTabletsLoadingStatus = createSelector(
    [
        (state) => state.navigation.tabs.tablets.loading,
        (state) => state.navigation.tabs.tablets.loaded,
        (state) => state.navigation.tabs.tablets.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
