import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import MetaTable, {
    Template,
    TemplateWeight,
} from '../../../../../../components/MetaTable/MetaTable';

import {formatShare} from '../../../../../../utils/operations/tabs/details/runtime';
import {showEditPoolsWeightsModal} from '../../../../../../store/actions/operations';
import hammer from '../../../../../../common/hammer';
import {OperationPool} from '../../../../../../components/OperationPool/OperationPool';

const headingBlock = cn('elements-heading');
const runtimeBlock = cn('runtime');

export const runtimeProps = PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string.isRequired,
        progress: PropTypes.object.isRequired,
    }),
);

function StarvingStatus({progress}) {
    const {starvation_status} = progress || {};
    const res = starvation_status ? hammer.format.Readable(starvation_status) : undefined;
    return res || null; // returns null to prevent react warning
}

export const operationProps = PropTypes.shape({
    $value: PropTypes.string,
    $attributes: PropTypes.object,
    type: PropTypes.string,
    user: PropTypes.string,
    pool: PropTypes.string,
    state: PropTypes.string,
    title: PropTypes.string,
    suspended: PropTypes.bool,
    duration: PropTypes.number,
    startTime: PropTypes.string,
    finishTime: PropTypes.string,
    description: PropTypes.object,
    pools: PropTypes.arrayOf(
        PropTypes.shape({
            tree: PropTypes.string.isRequired,
            pool: PropTypes.string.isRequired,
        }),
    ),
});

class Runtime extends Component {
    static propTypes = {
        // from parent component
        runtime: runtimeProps.isRequired,
        operation: operationProps.isRequired,
        cluster: PropTypes.string.isRequired,
        // from connect
        showEditPoolsWeightsModal: PropTypes.func.isRequired,
    };

    handlePoolEditClick = () => {
        const {showEditPoolsWeightsModal, operation} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderTree({progress, name}) {
        const {cluster, operation, showEditPoolsWeightsModal} = this.props;
        const {state} = operation;

        const pool = {
            pool: progress.pool,
            tree: name,
            weight: progress.weight,
        };

        return (
            <div className={runtimeBlock('tree')} key={name}>
                <div className={headingBlock({size: 's'})}>
                    {hammer.format['ReadableField'](name)}
                </div>

                <MetaTable
                    items={[
                        [
                            {
                                key: 'pool',
                                value: (
                                    <OperationPool
                                        onEdit={this.handlePoolEditClick}
                                        cluster={cluster}
                                        state={state}
                                        pool={pool}
                                        compact
                                        reserveEditButton
                                    />
                                ),
                            },
                            {
                                key: 'weight',
                                value: (
                                    <TemplateWeight
                                        operation={operation}
                                        pool={pool}
                                        onEdit={() => showEditPoolsWeightsModal(operation)}
                                    />
                                ),
                            },
                            {
                                key: 'min_share',
                                value:
                                    formatShare(progress.min_share_ratio) +
                                    ' / ' +
                                    formatShare(progress.adjusted_min_share_ratio),
                            },
                            {
                                key: 'fair_share_ratio',
                                value: formatShare(progress.fair_share_ratio),
                            },
                            {
                                key: 'usage_ratio',
                                value: formatShare(progress.usage_ratio),
                            },
                            {
                                key: 'demand_ratio',
                                value: formatShare(progress.demand_ratio),
                            },
                        ],
                        [
                            {
                                key: 'Starvation status',
                                value: <StarvingStatus progress={progress} />,
                            },
                            {
                                key: 'partitions',
                                value:
                                    progress.partitions?.completed +
                                    ' / ' +
                                    progress.partitions?.total,
                                visible: Boolean(progress.partitions),
                            },
                            {
                                key: 'scheduling_status',
                                value: hammer.format.Readable(progress.scheduling_status),
                            },
                            {
                                key: 'dominant_resource',
                                value: hammer.format.Readable(progress.dominant_resource),
                            },
                            {
                                key: 'preemptable_job_count',
                                value: (
                                    <Template.FormattedValue
                                        value={progress.preemptable_job_count}
                                        format="Number"
                                    />
                                ),
                            },
                            {
                                key: 'memory_size_per_jobs',
                                value: (
                                    <Template.FormattedValue
                                        // eslint-disable-next-line camelcase
                                        value={
                                            progress.resource_demand?.memory /
                                            progress.resource_demand?.user_slots
                                        }
                                        format="Bytes"
                                    />
                                ),
                                visible: Boolean(progress.resource_demand),
                            },
                        ],
                    ]}
                />
            </div>
        );
    }

    render() {
        const {runtime} = this.props;

        return (
            <div className={runtimeBlock()}>{_.map(runtime, (tree) => this.renderTree(tree))}</div>
        );
    }
}

export default connect(null, {showEditPoolsWeightsModal})(Runtime);
