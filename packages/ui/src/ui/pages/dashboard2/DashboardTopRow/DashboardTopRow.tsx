import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import b from 'bem-cn-lite';
import {Button, Flex} from '@gravity-ui/uikit';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {
    getEditMode,
    toggleImportDialogVisibility,
} from '../../../store/reducers/dashboard2/dashboard';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';

import {RequestQuotaButton} from '../../../components/RequestQuotaButton/RequestQuotaButton';

import {Page} from '../../../../shared/constants/settings';

import UIFactory from '../../../UIFactory';

import {ImportConfigDialog} from '../Dashboard/components/ImportConfigDialog/ImportConfigDialog';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import {AddWidgetMenu} from './AddWidgetMenu';

import './DashboardTopRow.scss';

const block = b('dashboard-top-row');

export function DashboardTopRow() {
    const dispatch = useDispatch();

    const editMode = useSelector(getEditMode);

    const {edit, cancel, save} = useDashboardActions();

    const toggleImportDialog = () => dispatch(toggleImportDialogVisibility());

    return (
        <RowWithName page={Page.DASHBOARD}>
            <Flex grow={true} justifyContent={'flex-end'} gap={3}>
                <MyRolesLink />
                <RequestQuotaButton page={Page.DASHBOARD} />
                {editMode && <ImportButton toggleImportDialog={toggleImportDialog} />}
                {editMode && <AddWidgetMenu />}
                {editMode && <CancelButton onCancel={cancel} />}
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

function CancelButton({onCancel}: {onCancel: () => void}) {
    return (
        <Button size={'m'} view={'action'} onClick={onCancel}>
            Cancel
        </Button>
    );
}

function ImportButton({toggleImportDialog}: {toggleImportDialog: () => void}) {
    return (
        <Button size={'m'} view={'outlined'} onClick={toggleImportDialog}>
            Import config
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
