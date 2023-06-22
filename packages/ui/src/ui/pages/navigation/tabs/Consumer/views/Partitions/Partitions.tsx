import React, {useEffect} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {createSelector} from 'reselect';
import type {Column, Settings} from '@yandex-cloud/react-data-table';

import format from '../../../../../../common/hammer/format';
import DataTableYT from '../../../../../../components/DataTableYT/DataTableYT';
import ErrorBlock from '../../../../../../components/Block/Block';
import {NoContent} from '../../../../../../components/NoContent/NoContent';
import {CONSUMER_RATE_MODE} from '../../../../../../constants/navigation/tabs/consumer';
import {
    datetime,
    error,
    multimeter,
    number,
} from '../../../../../../pages/navigation/tabs/Queue/utils/column-builder';
import {loadConsumerPartitions} from '../../../../../../store/actions/navigation/tabs/consumer/partitions';
import type {RootState} from '../../../../../../store/reducers';
import type {TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {
    SelectedPartition,
    getConsumerPartitionsColumns,
    getConsumerRateMode,
    getConsumerTimeWindow,
    getPartitions,
    getPartitionsError,
    getPartitionsLoaded,
    getPartitionsLoading,
    getTargetQueue,
} from '../../../../../../store/selectors/navigation/tabs/consumer';

import './Partitions.scss';

const block = cn('consumer-partitions');

const readRateName: Record<CONSUMER_RATE_MODE, string> = {
    [CONSUMER_RATE_MODE.ROWS]: 'Read rate',
    [CONSUMER_RATE_MODE.DATA_WEIGHT]: 'Read rate',
};
const readRateGetter: Record<CONSUMER_RATE_MODE, (row: SelectedPartition) => TPerformanceCounters> =
    {
        [CONSUMER_RATE_MODE.ROWS]: (x) => x.read_row_count_rate,
        [CONSUMER_RATE_MODE.DATA_WEIGHT]: (x) => x.read_data_weight_rate,
    };

const getColumns = createSelector(
    [getConsumerRateMode, getConsumerTimeWindow, getConsumerPartitionsColumns],
    (rateMode, timeWindow, columns): Array<Column<SelectedPartition>> => {
        return columns
            .filter((column) => column.checked)
            .map(({name, caption}) => {
                if (name === 'error') {
                    return error<SelectedPartition>(caption, (x) => x[name]);
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

const settings: Settings = {displayIndices: false};

const Partitions: React.VFC<PropsFromRedux> = ({
    loadConsumerPartitions,
    columns,
    partitions,
    partitionsError,
    partitionsLoading,
    partitionsLoaded,
}) => {
    const {queue} = useSelector(getTargetQueue) ?? {};

    useEffect(() => {
        if (queue) {
            loadConsumerPartitions(queue);
        }
    }, [queue]);

    if (!queue) {
        return (
            <NoContent
                hint={'Please select a queue'}
                warning={"You don't have any selected queues"}
            />
        );
    }

    if (partitionsError) {
        return <ErrorBlock error={partitionsError} topMargin="half" />;
    }

    return (
        <DataTableYT
            className={block('table-row')}
            columns={columns}
            data={partitions}
            loading={partitionsLoading}
            loaded={partitionsLoaded}
            useThemeYT
            settings={settings}
        />
    );
};

function mapStateToProps(state: RootState) {
    return {
        columns: getColumns(state),
        partitions: getPartitions(state),
        partitionsError: getPartitionsError(state),
        partitionsLoading: getPartitionsLoading(state),
        partitionsLoaded: getPartitionsLoaded(state),
    };
}

const mapDispatchToProps = {
    loadConsumerPartitions,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Partitions);
