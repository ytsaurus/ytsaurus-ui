import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import cn from 'bem-cn-lite';
import {createSelector} from 'reselect';
import type {Column, Settings} from '@yandex-cloud/react-data-table';

import format from '../../../../../../common/hammer/format';
import DataTableYT from '../../../../../../components/DataTableYT/DataTableYT';
import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import {
    bool,
    error,
    multimeter,
    user,
    ypath,
} from '../../../../../../pages/navigation/tabs/Queue/utils/column-builder';
import type {RootState} from '../../../../../../store/reducers';
import type {TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {
    getConsumers,
    getStatusLoading,
    getStatusLoaded,
    getQueueRateMode,
    getQueueTimeWindow,
    SelectedConsumer,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './Consumers.scss';

const block = cn('queue-consumers');

const readRateName: Record<QUEUE_RATE_MODE, string> = {
    [QUEUE_RATE_MODE.ROWS]: 'Read rate',
    [QUEUE_RATE_MODE.DATA_WEIGHT]: 'Read rate',
};
const readRateGetter: Record<QUEUE_RATE_MODE, (row: SelectedConsumer) => TPerformanceCounters> = {
    [QUEUE_RATE_MODE.ROWS]: (x) => x.read_row_count_rate,
    [QUEUE_RATE_MODE.DATA_WEIGHT]: (x) => x.read_data_weight_rate,
};

const getColumns = createSelector(
    [getQueueRateMode, getQueueTimeWindow],
    (rateMode, timeWindow): Array<Column<SelectedConsumer>> => [
        ypath<SelectedConsumer>('Consumer', (x) => x.ypath),
        error<SelectedConsumer>('Error', (x) => x.error),
        multimeter<SelectedConsumer>(
            readRateName[rateMode],
            readRateGetter[rateMode],
            timeWindow,
            rateMode === QUEUE_RATE_MODE.ROWS ? format.RowsPerSecond : format.BytesPerSecond,
        ),
        bool<SelectedConsumer>('Vital', (x) => x.vital),
        user<SelectedConsumer>('Owner', (x) => x.owner),
    ],
);

const settings: Settings = {displayIndices: false};

const Consumers: React.VFC<PropsFromRedux> = ({
    columns,
    consumers,
    consumersLoading,
    consumersLoaded,
}) => {
    return (
        <DataTableYT
            className={block('table-row')}
            columns={columns}
            data={consumers}
            loading={consumersLoading}
            loaded={consumersLoaded}
            useThemeYT
            settings={settings}
        />
    );
};

function mapStateToProps(state: RootState) {
    return {
        columns: getColumns(state),
        consumers: getConsumers(state),
        consumersLoading: getStatusLoading(state),
        consumersLoaded: getStatusLoaded(state),
    };
}

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Consumers);
