import React, {useState} from 'react';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import hammer from '../../../common/hammer';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

export function AddWidgetMenu() {
    const {add} = useDashboardActions();

    const [dropdownOpened, setDropdownOpened] = useState(false);

    const widgetsNames = [
        'navigation',
        'operations',
        'pools',
        'accounts',
        'queries',
        'services',
    ] as const;

    const menuItems = widgetsNames.map((item) => ({
        action: () => add(item),
        text: hammer.format['ReadableField'](item),
    }));

    return (
        <DropdownMenu
            renderSwitcher={(props) => (
                <Button {...props} size={'m'}>
                    <Flex alignItems={'center'} gap={3}>
                        Add widget
                        {dropdownOpened ? <ChevronDown /> : <ChevronUp />}
                    </Flex>
                </Button>
            )}
            onSwitcherClick={() => setDropdownOpened(!dropdownOpened)}
            items={menuItems}
        />
    );
}
