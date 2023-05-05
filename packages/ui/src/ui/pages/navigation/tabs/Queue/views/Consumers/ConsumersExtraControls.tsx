import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import cn from 'bem-cn-lite';

import Filter from '../../../../../../components/Filter/Filter';
import RadioButton from '../../../../../../components/RadioButton/RadioButton';
import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import {
    changeQueueConsumerName,
    changeQueueOwner,
    changeQueueRateMode,
    changeQueueTimeWindow,
} from '../../../../../../store/actions/navigation/tabs/queue/filters';
import type {RootState} from '../../../../../../store/reducers';
import {
    getQueueConsumerName,
    getQueueOwner,
    getQueueRateMode,
    getQueueTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './ConsumersExtraControls.scss';

const block = cn('queue-consumers');

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

const ConsumersExtraControls: React.VFC<Props> = ({
    queueConsumerName,
    queueRateMode,
    changeQueueConsumerName,
    changeQueueRateMode,
}) => {
    return (
        <>
            <div className={block('divider')} />
            <Filter
                className={block('filter')}
                value={queueConsumerName}
                onChange={changeQueueConsumerName}
                placeholder="Consumer name..."
            />
            <RadioButton value={queueRateMode} onChange={changeQueueRateMode} items={rateItems} />
        </>
    );
};

function mapStateToProps(state: RootState) {
    return {
        queueConsumerName: getQueueConsumerName(state),
        queueOwner: getQueueOwner(state),
        queueRateMode: getQueueRateMode(state),
        queueTimeWindow: getQueueTimeWindow(state),
    };
}

const mapDispatchToProps = {
    changeQueueConsumerName,
    changeQueueOwner,
    changeQueueRateMode,
    changeQueueTimeWindow,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ConsumersExtraControls);
