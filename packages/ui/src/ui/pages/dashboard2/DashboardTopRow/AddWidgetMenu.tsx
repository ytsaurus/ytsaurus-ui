import React, {useState} from 'react';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import i18n from './i18n';

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
        text: i18n(`title_${item}`),
    }));

    return (
        <DropdownMenu
            renderSwitcher={(props) => (
                <Button {...props} size={'m'} qa={'add-widget-button'}>
                    <Flex alignItems={'center'} gap={3}>
                        {i18n('action_add-widget')}
                        {dropdownOpened ? <ChevronUp /> : <ChevronDown />}
                    </Flex>
                </Button>
            )}
            onSwitcherClick={() => setDropdownOpened(!dropdownOpened)}
            items={menuItems}
        />
    );
}
