import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';

import {Button, Dialog} from '@gravity-ui/uikit';

import {getExecuteBatchState} from '../../store/selectors/execute-batch';
import {ExecuteBatchStateItem} from '../../store/reducers/execute-batch';

import ErrorBlock from '../../components/Error/Error';
import {rumLogError} from '../../rum/rum-counter';
import {
    abortExecuteBatch,
    retryExecuteBatch,
    skipExecuteBatch,
} from '../../store/actions/execute-batch';

const BUTTON_WIDTH_STYLE = {width: 128};

function RetryBatchImpl(props: ExecuteBatchStateItem) {
    const dispatch = useDispatch();
    const {id, error, showModal, options = {}} = props;
    const {disableSkip} = options;

    const handleRetry = React.useCallback(() => {
        dispatch(retryExecuteBatch(id));
    }, [dispatch, id]);

    const handleSkip = React.useCallback(() => {
        dispatch(skipExecuteBatch(id));
    }, [dispatch, id]);

    const handleAbort = React.useCallback(() => {
        dispatch(abortExecuteBatch(id));
    }, [dispatch, id]);

    const handleClose = React.useCallback(() => {
        rumLogError({
            message: 'RetryBatchImpl: handleClose should not be called ever',
        });
    }, []);

    return (
        <Dialog open={showModal} hasCloseButton={false} onClose={handleClose}>
            <Dialog.Header caption={'Error'} />
            <Dialog.Body>
                <div>Some sub-requests have been failed. Would you like to try again?</div>
                <ErrorBlock error={error} />
            </Dialog.Body>
            <Dialog.Footer
                preset={'default'}
                showError={false}
                listenKeyEnter={false}
                textButtonCancel={disableSkip ? 'Abort' : 'Skip'}
                textButtonApply={'Retry'}
                onClickButtonApply={handleRetry}
                onClickButtonCancel={disableSkip ? handleAbort : handleSkip}
            >
                {!disableSkip && (
                    <div style={BUTTON_WIDTH_STYLE}>
                        <Button onClick={handleAbort} size={'l'} width={'max'}>
                            Abort
                        </Button>
                    </div>
                )}
            </Dialog.Footer>
        </Dialog>
    );
}

const RetryBatch = React.memo(RetryBatchImpl);

function RetryBatchModals() {
    const state = useSelector(getExecuteBatchState);
    return (
        <React.Fragment>
            {_.map(state, (data, key) => {
                return <RetryBatch key={key} {...data} />;
            })}
        </React.Fragment>
    );
}

export default React.memo(RetryBatchModals);
