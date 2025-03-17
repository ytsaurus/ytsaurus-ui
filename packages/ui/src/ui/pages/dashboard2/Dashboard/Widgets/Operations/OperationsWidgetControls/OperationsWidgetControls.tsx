import React from 'react';
import {Button, Flex, Icon, RadioButton} from '@gravity-ui/uikit';
import {Gear} from '@gravity-ui/icons';

export function OperationsWidgetControls() {
    const onChange = () => {};

    return (
        <Flex direction={'row'} alignItems={'center'} gap={3}>
            <RadioButton
                options={[
                    {value: 'all', content: 'All'},
                    {value: 'failed', content: 'Failed'},
                    {value: 'running', content: 'Running'},
                ]}
                onChange={onChange}
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
