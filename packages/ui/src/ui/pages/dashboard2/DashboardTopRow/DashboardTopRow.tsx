import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import b from 'bem-cn-lite';
import {Button, Flex} from '@gravity-ui/uikit';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {
    getEditMode,
    toggleCopyConfigDialogVisibility,
} from '../../../store/reducers/dashboard2/dashboard';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';

import {Page} from '../../../../shared/constants/settings';

import UIFactory from '../../../UIFactory';

import {CopyConfigDialog} from '../Dashboard/components/CopyConfigDialog/CopyConfigDialog';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import {AddWidgetMenu} from './AddWidgetMenu';

import i18n from './i18n';

import './DashboardTopRow.scss';

const block = b('dashboard-top-row');

export function DashboardTopRow() {
    const editMode = useSelector(getEditMode);

    const {edit, cancel, save} = useDashboardActions();

    const handleClick = editMode ? save : edit;

    return (
        <RowWithName page={Page.DASHBOARD}>
            <Flex grow={true} justifyContent={'flex-end'} gap={3}>
                <MyRolesLink />
                {editMode && <CopyConfigButton />}
                {editMode && <AddWidgetMenu />}
                {editMode && <CancelButton onCancel={cancel} />}
                <Button size={'m'} view={'outlined'} onClick={handleClick}>
                    {editMode ? i18n('action_save-dashboard') : i18n('action_edit-dashboard')}
                </Button>
            </Flex>
            <CopyConfigDialog />
        </RowWithName>
    );
}

function CancelButton({onCancel}: {onCancel: () => void}) {
    return (
        <Button size={'m'} view={'outlined'} onClick={onCancel}>
            {i18n('action_cancel')}
        </Button>
    );
}

function CopyConfigButton() {
    const dispatch = useDispatch();
    return (
        <Button
            size={'m'}
            view={'outlined'}
            onClick={() => dispatch(toggleCopyConfigDialogVisibility())}
        >
            {i18n('action_copy-from')}
        </Button>
    );
}

function MyRolesLink() {
    const login = useSelector(getCurrentUserName);
    const cluster = useSelector(getCluster);
    return (
        UIFactory.renderRolesLink({
            login,
            cluster,
            className: block('roles-link'),
        }) ?? null
    );
}
