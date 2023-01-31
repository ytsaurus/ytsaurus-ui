import _ from 'lodash';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {histogramItems, tableItems} from '../../../../utils/navigation/tabs/tables';
import {NAVIGATION_TABLETS_TABLE_ID} from '../../../../constants/navigation/tabs/tablets';
import {prepareDataForColumns, prepareAggregation} from '../../../../utils/navigation/tabs/tablets';
import {calculateLoadingStatus} from '../../../../utils/utils';

export const getTabletsMode = (state) => state.navigation.tabs.tablets.tabletsMode;

const getRawTablets = (state) => state.navigation.tabs.tablets.tablets;
/** @returns { OldSortState } */
export const getTabletsSortState = (state) => state.tables[NAVIGATION_TABLETS_TABLE_ID];
const getTabletsFilter = (state) => state.navigation.tabs.tablets.tabletsFilter;
export const getActiveHistogram = (state) => state.navigation.tabs.tablets.histogramType;

const getSortedTablets = createSelector(
    [getRawTablets, getTabletsSortState],
    (rawTablets, sortState) => hammer.utils.sort(rawTablets, sortState, tableItems),
);

const getFilteredTablets = createSelector(
    [getSortedTablets, getTabletsFilter],
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

export const getPreparedDataForColumns = createSelector([getFilteredTablets], (items) => {
    /** @type {Array<TabletInfo>} */
    const res = prepareDataForColumns(items);
    return res;
});

export const getTablets = createSelector(getPreparedDataForColumns, (filteredTablets) => {
    const aggregation = prepareAggregation(filteredTablets);
    return [aggregation, ...filteredTablets];
});

const getHistograms = createSelector(getRawTablets, (tablets) => {
    return _.mapValues(histogramItems, (histogramItem, key) => {
        const get = histogramItem.get || tableItems[key].get;

        return {
            ...histogramItem,
            data: _.map(tablets, get),
            dataFormat: histogramItem.format,
            dataName: histogramItem.dataName || hammer.format['ReadableField'](key, {caps: 'none'}),
        };
    });
});

export const getHistogram = createSelector(
    [getHistograms, getActiveHistogram],
    (histograms, activeHistogram) => histograms[activeHistogram],
);

export const getNavigationTabletsLoadingStatus = createSelector(
    [
        (state) => state.navigation.tabs.tablets.loading,
        (state) => state.navigation.tabs.tablets.loaded,
        (state) => state.navigation.tabs.tablets.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
