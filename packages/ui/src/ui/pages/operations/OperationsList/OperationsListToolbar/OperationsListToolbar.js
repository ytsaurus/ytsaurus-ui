import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {selectAllUserNames} from '../../../../store/selectors/global';
import {
    toggleSaveFilterPresetDialog,
    updateFilter,
} from '../../../../store/actions/operations/list';
import {selectOperationsListFixedStartedByFilter_FOR_YTFRONT_2838} from '../../../../store/selectors/operations';

import './OperationsListToolbar.scss';

import {OperationsListToolbarBase} from './OperationsListToolbarBase';

function OperationsListToolbarHooked({children}) {
    const subjects = useSelector(selectAllUserNames);
    const {failedJobs} = useSelector((state) => state.operations.list.filters) || {};
    const fixedStartedByFilter = useSelector(
        selectOperationsListFixedStartedByFilter_FOR_YTFRONT_2838,
    );

    const dispatch = useDispatch();
    const handleUpdateFilter = React.useCallback(
        (...args) => {
            dispatch(updateFilter(...args));
        },
        [dispatch],
    );

    const handleToggleSaveFilterPresetDialog = React.useCallback(
        (...args) => {
            dispatch(toggleSaveFilterPresetDialog(...args));
        },
        [dispatch],
    );

    return (
        <OperationsListToolbarBase
            {...{
                subjects,
                failedJobsFilter: failedJobs,
                fixedStartedByFilter,
            }}
            updateFilter={handleUpdateFilter}
            toggleSaveFilterPresetDialog={handleToggleSaveFilterPresetDialog}
        >
            {children}
        </OperationsListToolbarBase>
    );
}

const OperationsListToolbar = React.memo(OperationsListToolbarHooked);

export default OperationsListToolbar;
