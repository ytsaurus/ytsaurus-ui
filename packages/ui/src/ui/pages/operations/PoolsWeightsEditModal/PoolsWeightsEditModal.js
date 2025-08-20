import React, {Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import every_ from 'lodash/every';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {YTErrorBlock} from '../../../components/Error/Error';
import Modal from '../../../components/Modal/Modal';
import Link from '../../../components/Link/Link';
import Yson from '../../../components/Yson/Yson';
import {TextInput} from '@gravity-ui/uikit';

import {hideEditPoolsWeightsModal, setPoolsAndWeights} from '../../../store/actions/operations';
import {Page} from '../../../constants/index';

import './PoolsWeightsEditModal.scss';
import {getCluster} from '../../../store/selectors/global';

PoolsWeightsEditModal.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    visible: PropTypes.bool.isRequired,
    editable: PropTypes.bool.isRequired,
    cluster: PropTypes.string.isRequired,
    operation: PropTypes.object,

    hideEditPoolsWeightsModal: PropTypes.func.isRequired,
    setPoolsAndWeights: PropTypes.func.isRequired,
};

const block = cn('operation-pools-weights');
const preparePoolsState = (pools) => {
    return reduce_(
        pools,
        (res, {pool, tree}) => {
            res[tree] = pool;
            return res;
        },
        {},
    );
};

const prepareWeightsState = (pools) => {
    return reduce_(
        pools,
        (res, {weight, tree}) => {
            res[tree] = String(weight);
            return res;
        },
        {},
    );
};

const renderPoolsAndWeights = ({
    cluster,
    operation,
    editable,
    pools,
    weights,
    setPools,
    setWeights,
}) => {
    return map_(operation.pools, ({tree}) => {
        const pool = pools[tree];
        const title = `${pool} [${tree}]`;
        const url = `/${cluster}/${Page.SCHEDULING}?tree=${tree}&pool=${pool}&tab=monitor`;

        return (
            <Fragment key={tree}>
                <div className={block('pool', 'elements-form_field')}>
                    {editable ? (
                        <TextInput
                            value={pool}
                            onUpdate={(pool) => {
                                setPools({...pools, [tree]: pool});
                            }}
                        />
                    ) : (
                        <span className="elements-ellipsis">
                            <Link url={url} title={title}>
                                <span className={block('pool-link')}>{pool}</span>
                            </Link>
                        </span>
                    )}
                </div>

                <div className={block('tree', 'elements-form_field')}>{tree}</div>

                <div className={block('weight', 'elements-form_field')}>
                    {editable ? (
                        <TextInput
                            value={weights[tree]}
                            onUpdate={(weight) => {
                                setWeights({...weights, [tree]: weight});
                            }}
                        />
                    ) : (
                        <span className="elements-ellipsis">{weights[tree]}</span>
                    )}
                </div>
            </Fragment>
        );
    });
};

function PoolsWeightsEditModal(props) {
    const {operation, setPoolsAndWeights} = props;
    const [pools, setPools] = useState(preparePoolsState(operation.pools));
    const [weights, setWeights] = useState(prepareWeightsState(operation.pools));

    useEffect(() => {
        setPools(preparePoolsState(operation.pools));
        setWeights(prepareWeightsState(operation.pools));
    }, [operation.$value]);

    const isConfirmDisabled = () => {
        const state = {operation};
        const isStateCorrect = state !== 'completed' && state !== 'failed' && state !== 'aborted';

        const isWeightCorrect = every_(keys_(weights), (tree) => {
            const value = Number(weights[tree]);
            return !isNaN(value) && value > 0;
        });

        const isPoolCorrect = every_(keys_(pools), (tree) => {
            const value = pools[tree];
            return Boolean(value);
        });

        return !isStateCorrect || !isWeightCorrect || !isPoolCorrect;
    };

    const handleConfirm = () => {
        setPoolsAndWeights(operation, pools, weights);
    };

    const {loading, error, errorData, visible, editable, hideEditPoolsWeightsModal} = props;
    const title = (
        <div className={block('title')}>{editable ? 'Edit' : 'View'} pools and weights</div>
    );

    return (
        <Modal
            size="l"
            title={title}
            loading={loading}
            visible={visible}
            footer={editable}
            confirmText="Apply"
            onConfirm={handleConfirm}
            onCancel={hideEditPoolsWeightsModal}
            isConfirmDisabled={isConfirmDisabled}
            content={
                <Fragment>
                    <div className={block('name')}>
                        <Yson value={operation.title || operation.$value} inline />
                    </div>
                    <div className={block()}>
                        <div className={block('header')}>Pool</div>
                        <div className={block('header')}>Tree</div>
                        <div className={block('header')}>Weight</div>
                        {renderPoolsAndWeights({
                            ...props,
                            pools,
                            weights,
                            setPools,
                            setWeights,
                        })}
                    </div>
                    {error && <YTErrorBlock className={block('error')} error={errorData} />}
                </Fragment>
            }
        />
    );
}

function mapStateToProps(state) {
    const {operations} = state;
    const {loading, loaded, error, errorData, visible, editable, operation} =
        operations.page.editWeightModal;

    return {
        loading,
        loaded,
        error,
        errorData,
        visible,
        editable,
        operation,
        cluster: getCluster(state),
    };
}

const mapDispatchToProps = {
    hideEditPoolsWeightsModal,
    setPoolsAndWeights,
};

export default connect(mapStateToProps, mapDispatchToProps)(PoolsWeightsEditModal);
