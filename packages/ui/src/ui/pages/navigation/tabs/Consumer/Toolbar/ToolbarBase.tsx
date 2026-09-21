import React, {type ComponentType} from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import {useDispatch} from '../../../../../store/redux-hooks';
import {Button} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {CONSUMER_MODE} from '../../../../../constants/navigation/tabs/consumer';
import {changeConsumerMode} from '../../../../../store/actions/navigation/tabs/consumer/filters';
import {toggleRegisterDialog} from '../../../../../store/reducers/navigation/tabs/consumer/register';
import {type RootState} from '../../../../../store/reducers';
import {selectConsumerMode} from '../../../../../store/selectors/navigation/tabs/consumer';

import i18n from './i18n';

import './Toolbar.scss';

const block = cn('consumer-toolbar');

interface Props extends PropsFromRedux {
    extras: ComponentType;
}

const tabItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: CONSUMER_MODE.METRICS,
        get text() {
            return i18n('value_metrics');
        },
    },
    {
        value: CONSUMER_MODE.PARTITIONS,
        get text() {
            return i18n('value_partitions');
        },
    },
];

const Toolbar: React.VFC<Props> = ({extras: Extras, consumerMode, changeConsumerMode}) => {
    const dispatch = useDispatch();
    const openRegisterDialog = () => dispatch(toggleRegisterDialog());

    return (
        <div className={block()}>
            <RadioButton value={consumerMode} onChange={changeConsumerMode} items={tabItems} />
            <Extras />
            <Button view={'outlined'} onClick={openRegisterDialog}>
                {i18n('action_register-to-queue')}
            </Button>
        </div>
    );
};

function mapStateToProps(state: RootState) {
    return {
        consumerMode: selectConsumerMode(state),
    };
}

const mapDispatchToProps = {
    changeConsumerMode,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Toolbar);
