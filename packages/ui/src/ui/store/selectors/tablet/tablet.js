import _ from 'lodash';
import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';
import {histogramItems} from '../../../utils/tablet/tablet';
import {partitionsTableItems} from '../../../utils/tablet/table';
import {TABLET_PARTITIONS_TABLE_ID} from '../../../constants/tablet';

const getRawPartitions = (state) => state.tablet.tablet.partitions;
const getSortState = (state) => state.tables[TABLET_PARTITIONS_TABLE_ID];
export const getActiveHistogram = (state) => state.tablet.tablet.activeHistogram;

export const getSortedPartitions = createSelector(
    [getRawPartitions, getSortState],
    (partitions, sortState) => hammer.utils.sort(partitions, sortState, partitionsTableItems),
);

export const getPartitions = createSelector(getSortedPartitions, (sortedPartitions) => {
    const aggregation = hammer.aggregation.prepare(sortedPartitions, [
        {name: 'stores', type: 'concat-array'},
        {name: 'storeCount', type: 'sum'},
        {name: 'unmergedRows', type: 'sum'},
        {name: 'uncompressed', type: 'sum'},
        {name: 'compressed', type: 'sum'},
        {name: 'sampleKeyCount', type: 'sum'},
    ])[0];

    aggregation.index = -2;

    return [aggregation, ...sortedPartitions];
});

const getHistograms = createSelector(getRawPartitions, (partitions) =>
    _.mapValues(histogramItems, (settings, key) => {
        const partitionsWithoutEden = partitions.slice(1);

        return {
            ...settings,
            dataSource: 'partitions',
            dataFormat: settings.format,
            caption: hammer.format['ReadableField'](key),
            dataName: settings.dataName || hammer.format['ReadableField'](key, {caps: 'none'}),
            data: _.map(partitionsWithoutEden, partitionsTableItems[key].get),
        };
    }),
);

export const getHistogram = createSelector(
    [getHistograms, getActiveHistogram],
    (histograms, activeHistogram) => histograms[activeHistogram],
);
