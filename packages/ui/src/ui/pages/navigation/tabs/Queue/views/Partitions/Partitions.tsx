import React, {useEffect} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';
import {createSelector} from 'reselect';
import type {Column, Settings} from '@gravity-ui/react-data-table';

import format from '../../../../../../common/hammer/format';
import DataTableYT from '../../../../../../components/DataTableYT/DataTableYT';
import {YTErrorBlock} from '../../../../../../components/Block/Block';
import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import {
    datetime,
    error,
    host,
    multimeter,
    number,
    string,
} from '../../../../../../pages/navigation/tabs/Queue/utils/column-builder';
import {loadQueuePartitions} from '../../../../../../store/actions/navigation/tabs/queue/partitions';
import type {RootState} from '../../../../../../store/reducers';
import type {TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {
    SelectedPartition,
    getPartitions,
    getPartitionsError,
    getPartitionsLoaded,
    getPartitionsLoading,
    getQueuePartitionsColumns,
    getQueueRateMode,
    getQueueTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './Partitions.scss';

const block = cn('queue-partitions');

const writeRateName: Record<QUEUE_RATE_MODE, string> = {
    [QUEUE_RATE_MODE.ROWS]: 'Write rate',
    [QUEUE_RATE_MODE.DATA_WEIGHT]: 'Write rate',
};

const writeRateGetter: Record<QUEUE_RATE_MODE, (row: SelectedPartition) => TPerformanceCounters> = {
    [QUEUE_RATE_MODE.ROWS]: (x) => x.write_row_count_rate,
    [QUEUE_RATE_MODE.DATA_WEIGHT]: (x) => x.write_data_weight_rate,
};

const getColumns = createSelector(
    [getQueueRateMode, getQueueTimeWindow, getQueuePartitionsColumns],
    (rateMode, timeWindow, columns): Array<Column<SelectedPartition>> => {
        return columns
            .filter((column) => column.checked)
            .map(({name, caption}) => {
                if (name === 'error') {
                    return error<SelectedPartition>(caption, (x) => x[name], block('error'));
                } else if (name === 'host') {
                    return host<SelectedPartition>(
                        caption,
                        (x) => x?.meta?.host || format.NO_VALUE,
                        block('hover-action'),
                    );
                } else if (name === 'cell_id') {
                    return string<SelectedPartition>(
                        caption,
                        (x) => x?.meta?.cell_id || format.NO_VALUE,
                    );
                } else if (name === 'write_rate') {
                    return multimeter<SelectedPartition>(
                        writeRateName[rateMode],
                        writeRateGetter[rateMode],
                        timeWindow,
                        rateMode === QUEUE_RATE_MODE.ROWS
                            ? format.RowsPerSecond
                            : format.BytesPerSecond,
                    );
                } else if (name === 'last_row_commit_time') {
                    return datetime<SelectedPartition>(caption, (x) => x[name]);
                } else {
                    return number<SelectedPartition>(caption, (x) => x[name]);
                }
            });
    },
);

const settings: Settings = {displayIndices: false};

const Partitions: React.VFC<PropsFromRedux> = ({
    loadQueuePartitions,
    columns,
    partitions,
    partitionsError,
    partitionsLoading,
    partitionsLoaded,
}) => {
    useEffect(() => {
        loadQueuePartitions();
    }, []);

    if (partitionsError) {
        return <YTErrorBlock error={partitionsError} topMargin="half" />;
    }

    return (
        <DataTableYT
            className={block()}
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
    loadQueuePartitions,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Partitions);
