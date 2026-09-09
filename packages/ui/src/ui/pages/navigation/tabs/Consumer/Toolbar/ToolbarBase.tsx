import React, {type ComponentType} from 'react';
import {useDispatch} from '../../../../../store/redux-hooks';
import {Button} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {CONSUMER_MODE} from '../../../../../constants/navigation/tabs/consumer';
import {toggleRegisterDialog} from '../../../../../store/reducers/navigation/tabs/consumer/register';

import i18n from './i18n';

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

export const ToolbarBase: React.VFC<Props> = ({
    extras: Extras,
    consumerMode,
    changeConsumerMode,
}) => {
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
type PropsFromRedux = {
    consumerMode: CONSUMER_MODE;
    changeConsumerMode: (evt: React.ChangeEvent<HTMLInputElement>) => void;
};
