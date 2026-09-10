import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {type Column} from '@gravity-ui/react-data-table';

import format from '../../../../../../common/hammer/format';
import {CONSUMER_RATE_MODE} from '../../../../../../constants/navigation/tabs/consumer';
import {
    datetime,
    error,
    multimeter,
    number,
} from '../../../../../../pages/navigation/tabs/Queue/utils/column-builder';
import {loadConsumerPartitions} from '../../../../../../store/actions/navigation/tabs/consumer/partitions';
import {type RootState} from '../../../../../../store/reducers';
import {type TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {
    type SelectedPartition,
    selectConsumerPartitionsColumns,
    selectConsumerRateMode,
    selectConsumerTimeWindow,
    selectPartitions,
    selectPartitionsError,
    selectPartitionsLoaded,
    selectPartitionsLoading,
} from '../../../../../../store/selectors/navigation/tabs/consumer';

import i18n from './i18n';

import './Partitions.scss';

import {PartitionsBase, block} from './PartitionsBase';

const readRateName: Record<CONSUMER_RATE_MODE, string> = {
    get [CONSUMER_RATE_MODE.ROWS]() {
        return i18n('field_read-rate');
    },
    get [CONSUMER_RATE_MODE.DATA_WEIGHT]() {
        return i18n('field_read-rate');
    },
};
const readRateGetter: Record<CONSUMER_RATE_MODE, (row: SelectedPartition) => TPerformanceCounters> =
    {
        [CONSUMER_RATE_MODE.ROWS]: (x) => x.read_row_count_rate,
        [CONSUMER_RATE_MODE.DATA_WEIGHT]: (x) => x.read_data_weight_rate,
    };

const getColumns = createSelector(
    [selectConsumerRateMode, selectConsumerTimeWindow, selectConsumerPartitionsColumns],
    (rateMode, timeWindow, columns): Array<Column<SelectedPartition>> => {
        return columns
            .filter((column) => column.checked)
            .map(({name, caption}) => {
                if (name === 'error') {
                    return error<SelectedPartition>(caption, (x) => x[name], block('error'));
                } else if (name === 'read_rate') {
                    return multimeter<SelectedPartition>(
                        readRateName[rateMode],
                        readRateGetter[rateMode],
                        timeWindow,
                        rateMode === CONSUMER_RATE_MODE.ROWS
                            ? format.RowsPerSecond
                            : format.BytesPerSecond,
                    );
                } else if (name === 'next_row_commit_time') {
                    return datetime<SelectedPartition>(caption, (x) => x[name]);
                } else {
                    return number<SelectedPartition>(caption, (x) => x[name]);
                }
            });
    },
);

function mapStateToProps(state: RootState) {
    return {
        columns: getColumns(state),
        partitions: selectPartitions(state),
        partitionsError: selectPartitionsError(state),
        partitionsLoading: selectPartitionsLoading(state),
        partitionsLoaded: selectPartitionsLoaded(state),
    };
}

const mapDispatchToProps = {
    loadConsumerPartitions,
};

const Partitions = connect(mapStateToProps, mapDispatchToProps)(PartitionsBase);

export default Partitions;
