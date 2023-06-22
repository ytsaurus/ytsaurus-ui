import React, {ComponentType} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {CONSUMER_MODE} from '../../../../../constants/navigation/tabs/consumer';
import {changeConsumerMode} from '../../../../../store/actions/navigation/tabs/consumer/filters';
import type {RootState} from '../../../../../store/reducers';
import {getConsumerMode} from '../../../../../store/selectors/navigation/tabs/consumer';

import './Toolbar.scss';

const block = cn('consumer-toolbar');

interface Props extends PropsFromRedux {
    extras: ComponentType;
}

const tabItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: CONSUMER_MODE.METRICS,
        text: 'Metrics',
    },
    {
        value: CONSUMER_MODE.PARTITIONS,
        text: 'Partitions',
    },
];

const Toolbar: React.VFC<Props> = ({extras: Extras, consumerMode, changeConsumerMode}) => {
    return (
        <div className={block()}>
            <RadioButton value={consumerMode} onChange={changeConsumerMode} items={tabItems} />
            <Extras />
        </div>
    );
};

function mapStateToProps(state: RootState) {
    return {
        consumerMode: getConsumerMode(state),
    };
}

const mapDispatchToProps = {
    changeConsumerMode,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Toolbar);
