import React, {type ComponentType} from 'react';
import cn from 'bem-cn-lite';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {QUEUE_MODE} from '../../../../../constants/navigation/tabs/queue';

import i18n from './i18n';

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

export const ToolbarBase: React.VFC<Props> = ({extras: Extras, queueMode, changeQueueMode}) => {
    return (
        <div className={block()}>
            <RadioButton value={queueMode} onChange={changeQueueMode} items={tabItems} />
            <Extras />
        </div>
    );
};
type PropsFromRedux = {
    queueMode: QUEUE_MODE;
    changeQueueMode: (evt: React.ChangeEvent<HTMLInputElement>) => void;
};
