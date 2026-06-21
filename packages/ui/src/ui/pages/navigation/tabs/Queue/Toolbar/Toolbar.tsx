import React, {type ComponentType} from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {QUEUE_MODE} from '../../../../../constants/navigation/tabs/queue';
import {changeQueueMode} from '../../../../../store/actions/navigation/tabs/queue/filters';
import {type RootState} from '../../../../../store/reducers';
import {selectQueueMode} from '../../../../../store/selectors/navigation/tabs/queue';

import i18n from './i18n';
import './Toolbar.scss';

const block = cn('queue-toolbar');

interface Props extends PropsFromRedux {
    extras: ComponentType;
}

const tabItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: QUEUE_MODE.METRICS,
        get text() {
            return i18n('value_metrics');
        },
    },
    {
        value: QUEUE_MODE.PARTITIONS,
        get text() {
            return i18n('value_partitions');
        },
    },
    {
        value: QUEUE_MODE.CONSUMERS,
        get text() {
            return i18n('value_consumers');
        },
    },
    {
        value: QUEUE_MODE.EXPORTS,
        get text() {
            return i18n('value_exports');
        },
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
        queueMode: selectQueueMode(state),
    };
}

const mapDispatchToProps = {
    changeQueueMode,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Toolbar);
