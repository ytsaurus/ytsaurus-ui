import React, {useState} from 'react';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

export function AddWidgetMenu() {
    const {add} = useDashboardActions();

    const [dropdownOpened, setDropdownOpened] = useState(false);

    return (
        <DropdownMenu
            renderSwitcher={(props) => (
                <Button {...props} size={'m'}>
                    <Flex alignItems={'center'} gap={3}>
                        Add
                        {dropdownOpened ? <ChevronDown /> : <ChevronUp />}
                    </Flex>
                </Button>
            )}
            onSwitcherClick={() => setDropdownOpened(!dropdownOpened)}
            items={[
                {
                    action: () => add('navigation'),
                    text: 'Navigation',
                },
                {
                    action: () => add('operations'),
                    text: 'Operations',
                },
                {
                    action: () => add('pools'),
                    text: 'Pools',
                },
                {
                    action: () => add('accounts'),
                    text: 'Accounts',
                },
                {
                    action: () => add('queries'),
                    text: 'Queries',
                },
                {
                    action: () => add('services'),
                    text: 'Services',
                },
            ]}
        />
    );
}
