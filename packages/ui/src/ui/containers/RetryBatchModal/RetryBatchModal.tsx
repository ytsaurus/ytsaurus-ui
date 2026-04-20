import React from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';

import map_ from 'lodash/map';

import {Button} from '@gravity-ui/uikit';
import {DialogWrapper as Dialog} from '../../components/DialogWrapper/DialogWrapper';

import {selectExecuteBatchState} from '../../store/selectors/execute-batch';
import {type ExecuteBatchStateItem} from '../../store/reducers/execute-batch';

import {YTErrorBlock} from '../../components/Error/Error';
import {rumLogError} from '../../rum/rum-counter';
import {
    abortExecuteBatch,
    retryExecuteBatch,
    skipExecuteBatch,
} from '../../store/actions/execute-batch';
import i18n from './i18n';

const BUTTON_WIDTH_STYLE = {width: 128};

function RetryBatchImpl(props: ExecuteBatchStateItem) {
    const dispatch = useDispatch();
    const {id, error, showModal, options} = props;
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
            <Dialog.Header caption={i18n('title_error')} />
            <Dialog.Body>
                <div>{i18n('alert_sub-requests-failed')}</div>
                <YTErrorBlock error={error} />
            </Dialog.Body>
            <Dialog.Footer
                preset={'default'}
                showError={false}
                textButtonCancel={disableSkip ? i18n('action_abort') : i18n('action_skip')}
                textButtonApply={i18n('action_retry')}
                onClickButtonApply={handleRetry}
                onClickButtonCancel={disableSkip ? handleAbort : handleSkip}
            >
                {!disableSkip && (
                    <div style={BUTTON_WIDTH_STYLE}>
                        <Button onClick={handleAbort} size={'l'} width={'max'}>
                            {i18n('action_abort')}
                        </Button>
                    </div>
                )}
            </Dialog.Footer>
        </Dialog>
    );
}

const RetryBatch = React.memo(RetryBatchImpl);

function RetryBatchModals() {
    const state = useSelector(selectExecuteBatchState);
    return (
        <React.Fragment>
            {map_(state, (data, key) => {
                return <RetryBatch key={key} {...data} />;
            })}
        </React.Fragment>
    );
}

export default React.memo(RetryBatchModals);
