import mapValues_ from 'lodash/mapValues';
import map_ from 'lodash/map';

import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {histogramItems, tableItems} from '../../../../utils/navigation/tabs/tables';
import {NAVIGATION_TABLETS_TABLE_ID} from '../../../../constants/navigation/tabs/tablets';
import {prepareAggregation, prepareDataForColumns} from '../../../../utils/navigation/tabs/tablets';
import {calculateLoadingStatus} from '../../../../utils/utils';

export const getTabletsMode = (state) => state.navigation.tabs.tablets.tabletsMode;

const getRawTablets = (state) => state.navigation.tabs.tablets.tablets;
const getRawReplicationLagTimes = (state) => state.navigation.tabs.tablets.replicationLagTimes;

/** @returns { OldSortState } */
export const getTabletsSortState = (state) => state.tables[NAVIGATION_TABLETS_TABLE_ID];
const getTabletsFilter = (state) => state.navigation.tabs.tablets.tabletsFilter;
export const getActiveHistogram = (state) => state.navigation.tabs.tablets.histogramType;

const selectSortedReplicationLagTimes = createSelector(
    [getRawReplicationLagTimes, getTabletsSortState],
    (rawTablets, sortState) => hammer.utils.sort(rawTablets, sortState, tableItems),
);

const selectFilteredReplicationLagTimes = createSelector(
    [selectSortedReplicationLagTimes, getTabletsFilter],
    (sortedTablets, tabletsFilter) =>
        hammer.filter.filter({
            data: sortedTablets,
            input: tabletsFilter,
            factors: [
                function (item) {
                    return tableItems['replication_lag_time']?.get?.(item);
                },
                function (item) {
                    return tableItems['replication_mode']?.get?.(item);
                },
            ],
        }),
);

const selectPreparedReplicationLagTimes = createSelector(
    [selectFilteredReplicationLagTimes],
    (items) => {
        const res = prepareDataForColumns(items);
        return res;
    },
);

const selectReplicationLagTimesMap = createSelector(
    [selectPreparedReplicationLagTimes],
    (replicationLagTimes) => {
        const map = new Map();
        replicationLagTimes.forEach((item) => {
            map.set(item.tablet_id, {
                replication_lag_time: item.replication_lag_time,
                replication_mode: item.replication_mode,
            });
        });
        return map;
    },
);

const selectSortedTablets = createSelector(
    [getRawTablets, getTabletsSortState],
    (rawTablets, sortState) => hammer.utils.sort(rawTablets, sortState, tableItems),
);

const selectFilteredTablets = createSelector(
    [selectSortedTablets, getTabletsFilter],
    (sortedTablets, tabletsFilter) =>
        hammer.filter.filter({
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
            ],
        }),
);

export const selectPreparedDataForColumns = createSelector([selectFilteredTablets], (items) => {
    /** @type {Array<TabletInfo>} */
    const res = prepareDataForColumns(items);
    return res;
});

const selectMergedPreparedTablets = createSelector(
    [selectPreparedDataForColumns, selectReplicationLagTimesMap],
    (tablets, replicationLagMap) => {
        return tablets.map((tablet) => {
            const replicationData = replicationLagMap.get(tablet.tablet_id);
            if (replicationData) {
                return {
                    ...tablet,
                    replication_lag_time: replicationData.replication_lag_time,
                    replication_mode: replicationData.replication_mode,
                };
            }
            return tablet;
        });
    },
);

export const selectIsReplicationDataExist = createSelector(
    [selectMergedPreparedTablets],
    (tablets) => {
        if (!tablets || tablets.length === 0) {
            return false;
        }
        return tablets.some(
            (tablet) => tablet && (tablet.replication_lag_time || Boolean(tablet.replication_mode)),
        );
    },
);

export const selectTablets = createSelector(selectMergedPreparedTablets, (filteredTablets) => {
    const aggregation = prepareAggregation(filteredTablets);
    return [aggregation, ...filteredTablets];
});

const selectHistograms = createSelector(getRawTablets, (tablets) => {
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
    [selectHistograms, getActiveHistogram],
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
