import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {
    getEditMode,
    toggleImportDialogVisibility,
} from '../../../store/reducers/dashboard2/dashboard';

import {Page} from '../../../../shared/constants/settings';

import {ImportConfigDialog} from '../Dashboard/components/ImportConfigDialog/ImportConfigDialog';

import {useUpdateDashboard} from '../hooks/use-update-dashboard';

export function DashboardTopRow() {
    const dispatch = useDispatch();

    const editMode = useSelector(getEditMode);

    const {edit, add, cancel, save, reset} = useUpdateDashboard();

    const [dropdownOpened, setDropdownOpened] = useState(false);

    const handleImportDialogVisibility = () => dispatch(toggleImportDialogVisibility());

    return (
        <RowWithName page={Page.DASHBOARD}>
            <Flex grow={true} justifyContent={'flex-end'} gap={2}>
                {editMode && (
                    <Button size={'m'} view={'outlined'} onClick={handleImportDialogVisibility}>
                        Import config
                    </Button>
                )}
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
            <ImportConfigDialog />
        </RowWithName>
    );
}
