import React from 'react';
import {type ConnectedProps, connect} from 'react-redux';
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
import {type RootState} from '../../../../../../store/reducers';
import {
    selectQueuePartitionIndex,
    selectQueuePartitionsColumns,
    selectQueueRateMode,
    selectQueueTabletCellHost,
    selectQueueTabletCellId,
    selectQueueTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './PartitionsExtraControls.scss';
import i18n from './i18n';

const block = cn('queue-partitions');

interface Props extends PropsFromRedux {}

const rateItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: QUEUE_RATE_MODE.ROWS,
        get text() {
            return i18n('value_rows');
        },
    },
    {
        value: QUEUE_RATE_MODE.DATA_WEIGHT,
        get text() {
            return i18n('value_data-weight');
        },
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
                placeholder={i18n('field_partition-index')}
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellHost}
                onChange={changeQueueTabletCellHost}
                placeholder={i18n('field_tablet-cell-host')}
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellId}
                onChange={changeQueueTabletCellId}
                placeholder={i18n('field_tablet-cell-id')}
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
        queuePartitionIndex: selectQueuePartitionIndex(state),
        queueTabletCellHost: selectQueueTabletCellHost(state),
        queueTabletCellId: selectQueueTabletCellId(state),
        queueRateMode: selectQueueRateMode(state),
        queueTimeWindow: selectQueueTimeWindow(state),
        queuePartitionsColumns: selectQueuePartitionsColumns(state),
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
