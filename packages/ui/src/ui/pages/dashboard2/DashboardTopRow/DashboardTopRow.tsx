import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {selectEditMode} from '../../../store/reducers/dashboard2/dashboard';

import {Page} from '../../../../shared/constants/settings';

import {useUpdateDashboard} from '../hooks/use-update-dashboard';

export function DashboardTopRow() {
    const {edit, add, cancel, save, reset} = useUpdateDashboard();

    const [dropdownOpened, setDropdownOpened] = useState(false);
    const editMode = useSelector(selectEditMode);

    return (
        <RowWithName page={Page.DASHBOARD2}>
            <Flex grow={true} justifyContent={'flex-end'} gap={2}>
                {editMode && (
                    <Button size={'m'} view={'outlined'} onClick={reset}>
                        Reset
                    </Button>
                )}
                {editMode && (
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
                        ]}
                    />
                )}
                {editMode && (
                    <Button size={'m'} view={'action'} onClick={cancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    size={'m'}
                    view={editMode ? 'outlined' : 'action'}
                    onClick={editMode ? () => save() : () => edit()}
                >
                    {editMode ? 'Save dashboard' : 'Edit dashboard'}
                </Button>
            </Flex>
        </RowWithName>
    );
}
