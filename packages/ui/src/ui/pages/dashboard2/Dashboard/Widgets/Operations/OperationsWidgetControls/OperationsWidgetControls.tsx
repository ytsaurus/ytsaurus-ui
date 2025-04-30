import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, RadioButton, Select} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {
    OperationStateFilter,
    getOperationsUsersTypeFilter,
    setOperationsStateFilter,
    setOperationsUsersTypeFilter,
} from '../../../../../../store/reducers/dashboard2/operations';

import './OperationsWidgetControls.scss';

const block = b('yt-operations-widget-controls');

export function OperationsWidgetControls(props: PluginWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const userType = useSelector((state: RootState) => getOperationsUsersTypeFilter(state, id));

    const onStateFilterUpdate = (value: string[]) => {
        dispatch(setOperationsStateFilter({id, state: value[0] as OperationStateFilter}));
    };
    const onUserTypeFilterUpdate = (value: 'me' | 'my-list') => {
        dispatch(setOperationsUsersTypeFilter({id, users: value}));
    };

    return (
        <Flex direction={'row'} alignItems={'center'} gap={3}>
            <Select
                placeholder={'State'}
                options={[
                    {value: 'all', content: 'All'},
                    {value: 'pending', content: 'Pending'},
                    {value: 'completed', content: 'Completed'},
                    {value: 'running', content: 'Running'},
                    {value: 'failed', content: 'Failed'},
                    {value: 'aborted', content: 'Aborted'},
                ]}
                onUpdate={onStateFilterUpdate}
                className={block('state')}
            />
            <RadioButton
                options={[
                    {value: 'me', content: 'Me'},
                    {value: 'my-list', content: 'My list'},
                ]}
                onUpdate={onUserTypeFilterUpdate}
                value={userType}
            />
        </Flex>
    );
}
