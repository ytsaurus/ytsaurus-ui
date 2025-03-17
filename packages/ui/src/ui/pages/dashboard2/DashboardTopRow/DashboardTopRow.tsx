import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getIsEditing} from '../../../store/selectors/dashboard2/dashboard';

import {Page} from '../../../../shared/constants/settings';

import {useUpdateDashboard} from './use-update-dashboard';

export function DashboardTopRow() {
    const dispatch = useDispatch();
    const {update} = useUpdateDashboard();

    const [dropdownOpened, setDropdownOpened] = useState(false);
    const isEditing = useSelector(getIsEditing);

    const onEdit = () => {
        dispatch(toggleEditing());
    };

    return (
        <RowWithName page={Page.DASHBOARD2}>
            <Flex grow={true} justifyContent={'flex-end'} gap={2}>
                {isEditing && (
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
                                action: () => update('navigation'),
                                text: 'Navigation',
                            },
                            {
                                action: () => update('operations'),
                                text: 'Operations',
                            },
                            {
                                action: () => update('pools'),
                                text: 'Pools',
                            },
                            {
                                action: () => update('accounts'),
                                text: 'Accounts',
                            },
                        ]}
                    />
                )}
                {isEditing && (
                    <Button size={'m'} view={'action'} onClick={onEdit}>
                        Cancel
                    </Button>
                )}
                <Button size={'m'} view={isEditing ? 'outlined' : 'action'} onClick={onEdit}>
                    {isEditing ? 'Save dashboard' : 'Edit dashboard'}
                </Button>
            </Flex>
        </RowWithName>
    );
}
