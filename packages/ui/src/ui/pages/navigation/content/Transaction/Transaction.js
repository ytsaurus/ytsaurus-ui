import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {main} from '../../../../components/MetaTable/presets';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';

import {
    abortTransaction,
    resetStore,
} from '../../../../store/actions/navigation/content/transaction';
import {getAttributes, getLoadState} from '../../../../store/selectors/navigation';
import withVisible from '../../../../hocs/withVisible';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import Yson from '../../../../components/Yson/Yson';

const block = cn('navigation-transaction');

Transaction.propTypes = {
    // from withVisible hoc
    visible: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleShow: PropTypes.func.isRequired,
};

function Transaction({visible, handleClose, handleShow}) {
    const dispatch = useDispatch();
    const attributes = useSelector(getAttributes);

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
            About to abort transaction <span className="elements-monospace">{id}</span>
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
                            value: <Yson value={title} />,
                            visible: Boolean(title),
                        },
                        {
                            key: 'start_time',
                            value: startTime,
                            visible: Boolean(startTime),
                        },
                        {
                            key: 'timeout',
                            value: timeout,
                            visible: Boolean(timeout),
                        },
                    ],
                ]}
            />

            <Button onClick={handleShow}>Abort</Button>
            <Modal
                title="Abort"
                visible={visible}
                loading={loading}
                confirmTheme="danger"
                confirmText="Abort"
                content={modalContent}
                onConfirm={handleTransactionAbort}
                onCancel={handleModalClose}
            />
        </div>
    );
}

const TransactionConnected = withVisible(Transaction);

export default function TransactionWithRum() {
    const loadState = useSelector(getLoadState);
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
