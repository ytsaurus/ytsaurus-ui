import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import i18n from './i18n';
import keys_ from 'lodash/keys';

import {DialogWrapper as DeleteDialog} from '../../../components/DialogWrapper/DialogWrapper';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {YTErrorBlock} from '../../../containers/Block/Block';

import Content from '../Content/Content';

import {ROOT_POOL_NAME, SCHEDULING_CREATE_POOL_CANCELLED} from '../../../constants/scheduling';
import {useUpdater} from '../../../hooks/use-updater';

import {
    closePoolDeleteModal as closeDeleteModal,
    deletePool,
    loadSchedulingData,
} from '../../../store/actions/scheduling/scheduling-ts';

import './Scheduling.scss';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {selectSchedulingIsFinalLoadingState} from '../../../store/selectors/scheduling';
import SchedulingResources from '../Content/SchedulingResources';
import {PoolEditorDialog} from './PoolEditorDialog/PoolEditorDialog';
import {type RootState} from '../../../store/reducers';
import {selectPool, selectSchedulingError} from '../../../store/selectors/scheduling/scheduling';
import {changePool} from '../../../store/actions/scheduling/scheduling';
import {SchedulingError} from './SchedulingError';

const block = cn('scheduling');

const SchedulingDialogsMemo = React.memo(SchedulingDialogs);

function Scheduling() {
    const error = useSelector(selectSchedulingError);
    const pool = useSelector(selectPool);
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(loadSchedulingData());
    }, [dispatch]);

    React.useEffect(() => {
        if (!pool) {
            dispatch(changePool(ROOT_POOL_NAME));
        }
    }, [pool, dispatch]);

    useUpdater(updateFn);

    return (
        <div className={block(null, 'elements-main-section')}>
            <ErrorBoundary>
                <div className={block('wrapper')}>
                    <SchedulingResources />
                    {error ? (
                        <SchedulingError error={error} poolName={pool} />
                    ) : (
                        <Content {...{className: block('content')}} />
                    )}
                </div>
                <SchedulingDialogsMemo />
            </ErrorBoundary>
        </div>
    );
}

const SchedulingMemo = React.memo(Scheduling);

export default function SchedulingWithRum() {
    const isFinalState = useSelector(selectSchedulingIsFinalLoadingState);

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
                    <DeleteDialog.Header caption={i18n('title_delete')} />
                    <DeleteDialog.Body>
                        {i18n('confirm_delete-pool-prefix')} <b>{deleteItem?.name}</b>{' '}
                        {i18n('confirm_delete-pool-suffix')}
                        {keys_(poolErrorData).length > 0 ? (
                            <YTErrorBlock
                                message={i18n('alert_delete-pool-failure')}
                                error={poolErrorData}
                            />
                        ) : null}
                    </DeleteDialog.Body>
                    <DeleteDialog.Footer
                        onClickButtonApply={deleteConfirmHandler}
                        onClickButtonCancel={deleteCloseHandler}
                        propsButtonApply={{view: 'flat-danger'}}
                        textButtonCancel={i18n('action_cancel')}
                        textButtonApply={i18n('action_delete')}
                    />
                </DeleteDialog>
            )}
            <PoolEditorDialog />
        </React.Fragment>
    );
}
