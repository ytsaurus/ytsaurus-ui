import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import {
    CompactColumnSelector,
    timeItems,
} from '../../../Consumer/views/Partitions/PartitionsExtraControls';
import Filter from '../../../../../../components/Filter/Filter';
import RadioButton from '../../../../../../components/RadioButton/RadioButton';
import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import {
    changeQueuePartitionIndex,
    changeQueuePartitionsColumns,
    changeQueueRateMode,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueTimeWindow,
} from '../../../../../../store/actions/navigation/tabs/queue/filters';
import type {RootState} from '../../../../../../store/reducers';
import {
    getQueuePartitionIndex,
    getQueuePartitionsColumns,
    getQueueRateMode,
    getQueueTabletCellHost,
    getQueueTabletCellId,
    getQueueTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './PartitionsExtraControls.scss';

const block = cn('queue-partitions');

interface Props extends PropsFromRedux {}

const rateItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: QUEUE_RATE_MODE.ROWS,
        text: 'Rows',
    },
    {
        value: QUEUE_RATE_MODE.DATA_WEIGHT,
        text: 'Data weight',
    },
];

const PartitionsExtraControls: React.VFC<Props> = ({
    queuePartitionIndex,
    queueTabletCellHost,
    queueTabletCellId,
    queueRateMode,
    queueTimeWindow,
    queuePartitionsColumns,
    changeQueuePartitionIndex,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueRateMode,
    changeQueueTimeWindow,
    changeQueuePartitionsColumns,
}) => {
    return (
        <>
            <div className={block('divider')} />
            <Filter
                className={block('filter')}
                value={queuePartitionIndex}
                onChange={changeQueuePartitionIndex}
                placeholder="Partition index..."
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellHost}
                onChange={changeQueueTabletCellHost}
                placeholder="Tablet cell host..."
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellId}
                onChange={changeQueueTabletCellId}
                placeholder="Tablet cell ID..."
            />
            <div className={block('divider')} />
            <RadioButton value={queueRateMode} onChange={changeQueueRateMode} items={rateItems} />
            <RadioButton
                value={queueTimeWindow}
                onChange={changeQueueTimeWindow}
                items={timeItems}
            />
            <CompactColumnSelector
                items={queuePartitionsColumns}
                onChange={changeQueuePartitionsColumns}
            />
        </>
    );
};

function mapStateToProps(state: RootState) {
    return {
        queuePartitionIndex: getQueuePartitionIndex(state),
        queueTabletCellHost: getQueueTabletCellHost(state),
        queueTabletCellId: getQueueTabletCellId(state),
        queueRateMode: getQueueRateMode(state),
        queueTimeWindow: getQueueTimeWindow(state),
        queuePartitionsColumns: getQueuePartitionsColumns(state),
    };
}

const mapDispatchToProps = {
    changeQueuePartitionIndex,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueRateMode,
    changeQueueTimeWindow,
    changeQueuePartitionsColumns,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(PartitionsExtraControls);
