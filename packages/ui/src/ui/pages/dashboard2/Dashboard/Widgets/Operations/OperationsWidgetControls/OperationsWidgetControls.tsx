import React from 'react';
import {useDispatch} from 'react-redux';
import b from 'bem-cn-lite';
import {Flex, RadioButton, Select} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {
    setOperationsFilterState,
    setOperationsResponsibleType,
} from '../../../../../../store/reducers/dashboard2/operations';

import './OperationsWidgetControls.scss';

const block = b('yt-operations-widget-controls');

export function OperationsWidgetControls(props: PluginWidgetProps) {
    const {id} = props;

    const dispatch = useDispatch();

    const onStateUpdate = (value: string[]) => {
        dispatch(setOperationsFilterState({id, state: value[0]}));
    };
    const onResponsibleUpdate = (value: 'me' | 'my-list') => {
        dispatch(setOperationsResponsibleType({id, responsible: value}));
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
                onUpdate={onStateUpdate}
                className={block('state')}
            />
            <RadioButton
                options={[
                    {value: 'me', content: 'Me'},
                    {value: 'my-list', content: 'My list'},
                ]}
                onUpdate={onResponsibleUpdate}
            />
        </Flex>
    );
}
