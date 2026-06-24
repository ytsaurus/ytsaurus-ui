import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import {MetaTable} from '@ytsaurus/components';
import {main} from '../../../../components/MetaTable/presets';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';

import {
    abortTransaction,
    resetStore,
} from '../../../../store/actions/navigation/content/transaction';
import {selectAttributes, selectLoadState} from '../../../../store/selectors/navigation';
import withVisible from '../../../../hocs/withVisible';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {Yson} from '../../../../components/Yson/Yson';
import i18n from './i18n';

const block = cn('navigation-transaction');

Transaction.propTypes = {
    // from withVisible hoc
    visible: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleShow: PropTypes.func.isRequired,
};

function Transaction({visible, handleClose, handleShow}) {
    const dispatch = useDispatch();
    const attributes = useSelector(selectAttributes);

    const [title, startTime, timeout, id] = ypath.getValues(attributes, [
        '/title',
        '/start_time',
        '/timeout',
        '/id',
    ]);
    const {loading, error, errorData} = useSelector(
        (state) => state.navigation.content.transaction,
    );

    const handleTransactionAbort = useCallback(() => dispatch(abortTransaction(id)), [dispatch]);
    const handleModalClose = useCallback(() => {
        handleClose();
        dispatch(resetStore());
    }, [dispatch, handleClose]);

    const modalContent = (
        <LoadDataHandler loaded={false} error={error} errorData={errorData}>
            {i18n('confirm_abort-transaction', {id})}
        </LoadDataHandler>
    );

    return (
        <div className={block()}>
            <MetaTable
                items={[
                    main(attributes),
                    [
                        {
                            key: 'title',
                            label: i18n('field_title'),
                            value: <Yson value={title} />,
                            visible: Boolean(title),
                        },
                        {
                            key: 'start-time',
                            label: i18n('field_start-time'),
                            value: startTime,
                            visible: Boolean(startTime),
                        },
                        {
                            key: 'timeout',
                            label: i18n('field_timeout'),
                            value: timeout,
                            visible: Boolean(timeout),
                        },
                    ],
                ]}
            />

            <Button onClick={handleShow}>{i18n('action_abort')}</Button>
            <Modal
                title={i18n('action_abort')}
                visible={visible}
                loading={loading}
                confirmTheme="danger"
                confirmText={i18n('action_abort')}
                content={modalContent}
                onConfirm={handleTransactionAbort}
                onCancel={handleModalClose}
            />
        </div>
    );
}

const TransactionConnected = withVisible(Transaction);

export default function TransactionWithRum() {
    const loadState = useSelector(selectLoadState);
    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TransactionConnected />;
}
