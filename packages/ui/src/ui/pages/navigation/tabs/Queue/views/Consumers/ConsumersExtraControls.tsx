import React from 'react';
import {Button} from '@gravity-ui/uikit';
import {type ConnectedProps, connect} from 'react-redux';
import {useDispatch} from '../../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import Filter from '../../../../../../components/Filter/Filter';
import RadioButton from '../../../../../../components/RadioButton/RadioButton';
import {QUEUE_RATE_MODE} from '../../../../../../constants/navigation/tabs/queue';
import i18n from './i18n';

import {
    toggleCreateDialog,
    toggleRegisterDialog,
} from '../../../../../../store/reducers/navigation/tabs/queue/consumers';
import {
    changeQueueConsumerName,
    changeQueueOwner,
    changeQueueRateMode,
    changeQueueTimeWindow,
} from '../../../../../../store/actions/navigation/tabs/queue/filters';
import {type RootState} from '../../../../../../store/reducers';
import {
    selectQueueConsumerName,
    selectQueueOwner,
    selectQueueRateMode,
    selectQueueTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/queue';

import './ConsumersExtraControls.scss';

const block = cn('queue-consumers');

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

const ConsumersExtraControls: React.VFC<Props> = ({
    queueConsumerName,
    queueRateMode,
    changeQueueConsumerName,
    changeQueueRateMode,
}) => {
    const dispatch = useDispatch();
    const openCreateDialog = () => dispatch(toggleCreateDialog());
    const openRegisterDialog = () => dispatch(toggleRegisterDialog());
    return (
        <>
            <div className={block('divider')} />
            <Filter
                className={block('filter')}
                value={queueConsumerName}
                onChange={changeQueueConsumerName}
                placeholder={i18n('context_consumer-name-placeholder')}
            />
            <RadioButton value={queueRateMode} onChange={changeQueueRateMode} items={rateItems} />
            <Button view={'outlined'} onClick={openCreateDialog}>
                {i18n('action_create-consumer')}
            </Button>
            <Button view={'outlined'} onClick={openRegisterDialog}>
                {i18n('action_register-consumer')}
            </Button>
        </>
    );
};

function mapStateToProps(state: RootState) {
    return {
        queueConsumerName: selectQueueConsumerName(state),
        queueOwner: selectQueueOwner(state),
        queueRateMode: selectQueueRateMode(state),
        queueTimeWindow: selectQueueTimeWindow(state),
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
