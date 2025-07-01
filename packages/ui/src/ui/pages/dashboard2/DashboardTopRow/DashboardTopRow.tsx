import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
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

import './DashboardTopRow.scss';

const block = b('dashboard-top-row');

export function DashboardTopRow() {
    const editMode = useSelector(getEditMode);

    const {edit, cancel, save} = useDashboardActions();

    return (
        <RowWithName page={Page.DASHBOARD}>
            <Flex grow={true} justifyContent={'flex-end'} gap={3}>
                <MyRolesLink />
                {editMode && <CopyConfigButton />}
                {editMode && <AddWidgetMenu />}
                {editMode && <CancelButton onCancel={cancel} />}
                <Button
                    size={'m'}
                    view={'outlined'}
                    onClick={editMode ? () => save() : () => edit()}
                >
                    {editMode ? 'Save dashboard' : 'Edit dashboard'}
                </Button>
            </Flex>
            <CopyConfigDialog />
        </RowWithName>
    );
}

function CancelButton({onCancel}: {onCancel: () => void}) {
    return (
        <Button size={'m'} view={'outlined'} onClick={onCancel}>
            Cancel
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
            Copy from
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
