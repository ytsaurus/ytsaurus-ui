import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import keys_ from 'lodash/keys';

import {Dialog as DeleteDialog} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Error from '../../../components/Error/Error';

import Content from '../Content/Content';

import {SCHEDULING_CREATE_POOL_CANCELLED} from '../../../constants/scheduling';
import {useUpdater} from '../../../hooks/use-updater';

import {
    closePoolDeleteModal as closeDeleteModal,
    deletePool,
    loadSchedulingData,
} from '../../../store/actions/scheduling/scheduling-ts';

import './Scheduling.scss';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {getSchedulingIsFinalLoadingState} from '../../../store/selectors/scheduling';
import SchedulingResources from '../Content/SchedulingResources';
import {PoolEditorDialog} from './PoolEditorDialog/PoolEditorDialog';
import {RootState} from '../../../store/reducers';

const block = cn('scheduling');

const SchedulingDialogsMemo = React.memo(SchedulingDialogs);

function Scheduling() {
    const error = useSelector((state: RootState) => {
        const {error: hasError, errorData} = state.scheduling.scheduling;
        return hasError ? errorData : undefined;
    });
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(loadSchedulingData());
    }, [dispatch]);

    useUpdater(updateFn);

    return (
        <div className={block(null, 'elements-main-section')}>
            <ErrorBoundary>
                {error && <Error error={error} />}
                <div className={block('wrapper')}>
                    <SchedulingResources />
                    <Content {...{className: block('content')}} />
                </div>
                <SchedulingDialogsMemo />
            </ErrorBoundary>
        </div>
    );
}

const SchedulingMemo = React.memo(Scheduling);

export default function SchedulingWithRum() {
    const isFinalState = useSelector(getSchedulingIsFinalLoadingState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.SCHEDULING,
        startDeps: [isFinalState],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    return <SchedulingMemo />;
}

function SchedulingDialogs() {
    const dispatch = useDispatch();

    const {deleteVisibility, deleteItem, poolErrorData} = useSelector(
        (state: RootState) => state.scheduling.scheduling,
    );

    const deleteConfirmHandler = React.useCallback(
        () => dispatch(deletePool(deleteItem)),
        [deleteItem, dispatch],
    );
    const deleteCloseHandler = React.useCallback(() => {
        dispatch({type: SCHEDULING_CREATE_POOL_CANCELLED});
        dispatch(closeDeleteModal());
    }, [dispatch]);

    return (
        <React.Fragment>
            {deleteVisibility && (
                <DeleteDialog
                    size="m"
                    className={block('delete-dialog')}
                    open={deleteVisibility}
                    onClose={deleteCloseHandler}
                    hasCloseButton
                >
                    <DeleteDialog.Header caption="Delete" />
                    <DeleteDialog.Body>
                        Are you sure you want to delete the <b>{deleteItem?.name}</b> pool?
                        {keys_(poolErrorData).length > 0 ? (
                            <Error message="Delete pool failure" error={poolErrorData} />
                        ) : null}
                    </DeleteDialog.Body>
                    <DeleteDialog.Footer
                        onClickButtonApply={deleteConfirmHandler}
                        onClickButtonCancel={deleteCloseHandler}
                        propsButtonApply={{view: 'flat-danger'}}
                        textButtonCancel="Cancel"
                        textButtonApply="Delete"
                    />
                </DeleteDialog>
            )}
            <PoolEditorDialog />
        </React.Fragment>
    );
}
