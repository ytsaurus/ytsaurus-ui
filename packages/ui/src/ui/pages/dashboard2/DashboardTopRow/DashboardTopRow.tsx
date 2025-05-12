import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Flex} from '@gravity-ui/uikit';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {
    getEditMode,
    toggleImportDialogVisibility,
} from '../../../store/reducers/dashboard2/dashboard';

import {Page} from '../../../../shared/constants/settings';

import {ImportConfigDialog} from '../Dashboard/components/ImportConfigDialog/ImportConfigDialog';

import {useDashboardActions} from '../hooks/use-dashboard-actions';

import {AddWidgetMenu} from './AddWidgetMenu';

export function DashboardTopRow() {
    const dispatch = useDispatch();

    const editMode = useSelector(getEditMode);

    const {edit, cancel, save} = useDashboardActions();

    const toggleImportDialog = () => dispatch(toggleImportDialogVisibility());

    return (
        <RowWithName page={Page.DASHBOARD}>
            <Flex grow={true} justifyContent={'flex-end'} gap={2}>
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
