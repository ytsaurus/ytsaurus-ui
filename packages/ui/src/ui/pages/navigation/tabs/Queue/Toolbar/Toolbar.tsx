import React, {ComponentType} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {QUEUE_MODE} from '../../../../../constants/navigation/tabs/queue';
import {changeQueueMode} from '../../../../../store/actions/navigation/tabs/queue/filters';
import type {RootState} from '../../../../../store/reducers';
import {getQueueMode} from '../../../../../store/selectors/navigation/tabs/queue';

import './Toolbar.scss';

const block = cn('queue-toolbar');

interface Props extends PropsFromRedux {
    extras: ComponentType;
}

const tabItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: QUEUE_MODE.METRICS,
        text: 'Metrics',
    },
    {
        value: QUEUE_MODE.PARTITIONS,
        text: 'Partitions',
    },
    {
        value: QUEUE_MODE.CONSUMERS,
        text: 'Consumers',
    },
];

const Toolbar: React.VFC<Props> = ({extras: Extras, queueMode, changeQueueMode}) => {
    return (
        <div className={block()}>
            <RadioButton value={queueMode} onChange={changeQueueMode} items={tabItems} />
            <Extras />
        </div>
    );
};

function mapStateToProps(state: RootState) {
    return {
        queueMode: getQueueMode(state),
    };
}

const mapDispatchToProps = {
    changeQueueMode,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Toolbar);
