import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {createSelector} from 'reselect';
import type {Column, Settings} from '@gravity-ui/react-data-table';
import {Button} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';
import DataTableYT from '../../../../../../components/DataTableYT/DataTableYT';
import Icon from '../../../../../../components/Icon/Icon';

import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import {
    bool,
    error,
    multimeter,
    ypath,
} from '../../../../../../pages/navigation/tabs/Queue/utils/column-builder';
import type {TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {openUnregisterDialog} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {
    SelectedConsumer,
    getConsumers,
    getQueueRateMode,
    getQueueTimeWindow,
    getStatusLoaded,
    getStatusLoading,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import {CreateConsumerDialog} from './CreateConsumerDialog';
import {UnregisterConsumerDialog} from './UnregisterConsumerDialog';
import {RegisterConsumerDialog} from './RegisterConsumerDialog';

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
        ypath<SelectedConsumer>('Consumer', (x) => x.consumer),
        error<SelectedConsumer>('Error', (x) => x.error),
        multimeter<SelectedConsumer>(
            readRateName[rateMode],
            readRateGetter[rateMode],
            timeWindow,
            rateMode === QUEUE_RATE_MODE.ROWS ? format.RowsPerSecond : format.BytesPerSecond,
        ),
        bool<SelectedConsumer>('Vital', (x) => x.vital),
        {
            name: 'actions',
            render: (value) => {
                return <UnregisterConsumer consumerPath={value.row.consumer} />;
            },
            header: '',
        },
    ],
);

function UnregisterConsumer({consumerPath}: {consumerPath: string}) {
    const dispatch = useDispatch();
    return (
        <Button view={'flat'} onClick={() => dispatch(openUnregisterDialog({consumerPath}))}>
            <Icon awesome={'xmark'} size={'l'} />
        </Button>
    );
}

const settings: Settings = {displayIndices: false};

export default function Consumers() {
    const columns = useSelector(getColumns);
    const consumers = useSelector(getConsumers);
    const consumersLoading = useSelector(getStatusLoading);
    const consumersLoaded = useSelector(getStatusLoaded);

    return (
        <>
            <DataTableYT
                className={block('table-row')}
                columns={columns}
                data={consumers}
                loading={consumersLoading}
                loaded={consumersLoaded}
                useThemeYT
                settings={settings}
            />
            <CreateConsumerDialog />
            <UnregisterConsumerDialog />
            <RegisterConsumerDialog />
        </>
    );
}
