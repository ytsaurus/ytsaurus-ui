import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {CONSUMER_STATUS_LOAD_SUCCESS} from '../../../../../../constants/navigation/tabs/consumer';
import {type ConsumerStatusData} from '../../../../../../store/reducers/navigation/tabs/consumer/status';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {selectConsumerNames} from '../../../../../../store/selectors/navigation/tabs/consumer';
import TargetQueue from '../TargetQueue';

const namedConsumersData: ConsumerStatusData = {
    queue_consumer_names: ['primary', 'analytics'],
    consumers: {
        primary: {registrations: [{queue: 'markov://home/queues/primary', vital: false}]},
        analytics: {registrations: [{queue: 'markov://home/queues/analytics', vital: true}]},
    },
};

const brokenConsumerData: ConsumerStatusData = {
    queue_consumer_names: ['broken', 'primary'],
    consumers: {
        broken: {error: {code: 1, message: 'Consumer failed'}},
        primary: {registrations: [{queue: 'markov://home/queues/primary', vital: false}]},
    },
};

function SeededTargetQueue({consumerData}: {consumerData: ConsumerStatusData}) {
    const dispatch = useDispatch();
    const names = useSelector(selectConsumerNames);

    React.useEffect(() => {
        dispatch({type: CONSUMER_STATUS_LOAD_SUCCESS, data: consumerData});
    }, [consumerData, dispatch]);

    return names ? (
        <div style={{width: 560}}>
            <TargetQueue />
        </div>
    ) : null;
}

const meta: Meta<typeof SeededTargetQueue> = {
    title: 'Pages/Navigation/Consumer/TargetQueue',
    component: SeededTargetQueue,
    args: {consumerData: namedConsumersData},
};

export default meta;
type Story = StoryObj<typeof SeededTargetQueue>;

export const NamedConsumers: Story = {};

export const BrokenNamedConsumer: Story = {
    args: {consumerData: brokenConsumerData},
};
