import React from 'react';
import {useDispatch} from 'react-redux';
import b from 'bem-cn-lite';
import {Button, Flex, Icon, RadioButton, Select} from '@gravity-ui/uikit';
import {Gear} from '@gravity-ui/icons';

import {setOperationsFilterState} from '../../../../../../store/reducers/dashboard2/operations';

import './OperationsWidgetControls.scss';

const block = b('yt-operations-widget-controls');

export function OperationsWidgetControls() {
    const dispatch = useDispatch();
    const onUpdate = (value: string[]) => {
        dispatch(setOperationsFilterState({state: value[0]}));
    };
    const onChange = () => {};

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
                onUpdate={onUpdate}
                className={block('state')}
            />
            <RadioButton
                options={[
                    {value: 'my', content: 'My'},
                    {value: 'robots', content: 'My robots'},
                ]}
                onChange={onChange}
            />
            <Button size="m">
                <Icon data={Gear} size={16} />
            </Button>
        </Flex>
    );
}
