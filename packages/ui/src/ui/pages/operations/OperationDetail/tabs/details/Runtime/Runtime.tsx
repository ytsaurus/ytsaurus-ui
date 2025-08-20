import React, {Component, FC} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import MetaTable, {
    Template,
    TemplateWeight,
} from '../../../../../../components/MetaTable/MetaTable';

import {formatShare} from '../../../../../../utils/operations/tabs/details/runtime';
import {showEditPoolsWeightsModal} from '../../../../../../store/actions/operations';
import hammer from '../../../../../../common/hammer';
import {OperationPool} from '../../../../../../components/OperationPool/OperationPool';
import ypath from '../../../../../../common/thor/ypath';
import {RuntimeItem, RuntimeProgress} from '../../../../../../store/reducers/operations/detail';
import {Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

const headingBlock = cn('elements-heading');
const runtimeBlock = cn('runtime');

export type PoolItem = {
    tree: string;
    pool: string;
};

export type Operation = {
    $value?: string;
    $attributes?: Record<string, any>;
    type?: string;
    user?: string;
    pool?: string;
    state?: string;
    title?: string;
    suspended?: boolean;
    duration?: number;
    startTime?: string;
    finishTime?: string;
    pools?: PoolItem[];
};

type StarvingStatusProps = {
    progress: RuntimeProgress;
};

const StarvingStatus: FC<StarvingStatusProps> = ({progress}) => {
    const {starvation_status} = progress || {};
    const res = starvation_status ? hammer.format.Readable(starvation_status) : undefined;
    return res || null; // returns null to prevent react warning
};

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
};

const connector = connect(null, mapDispatchToProps);

export type Props = {
    runtime: RuntimeItem[];
    operation: Operation;
    cluster: string;
} & ConnectedProps<typeof connector>;

class Runtime extends Component<Props> {
    handlePoolEditClick = () => {
        const {showEditPoolsWeightsModal, operation} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderTree({progress, name}: RuntimeItem) {
        const {cluster, operation, showEditPoolsWeightsModal} = this.props;
        const {state} = operation;

        const pool = {
            pool: progress.pool,
            tree: name,
            weight: progress.weight,
        };

        const isGang = ypath.getValue(operation, '/@full_spec/is_gang');

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
                                key: 'fifo_index',
                                label: (
                                    <Tooltip content="Operation's position in the pool's queue. Operations on lower positions will be scheduled sooner.">
                                        <Flex alignItems="center" gap={1}>
                                            FIFO index <Icon data={CircleQuestionIcon} size={16} />
                                        </Flex>
                                    </Tooltip>
                                ),
                                value: (
                                    <Template.FormattedValue
                                        value={progress.fifo_index}
                                        format="Number"
                                    />
                                ),
                            },
                            {
                                key: 'fair_share',
                                value: formatShare(progress.fair_share_ratio),
                            },
                            {
                                key: 'usage',
                                value: formatShare(progress.usage_ratio),
                            },
                            {
                                key: 'demand',
                                value: formatShare(progress.demand_ratio),
                            },
                        ],
                        [
                            {
                                key: 'dominant_resource',
                                value: hammer.format.Readable(progress.dominant_resource),
                            },
                            {
                                key: 'Starvation status',
                                value: <StarvingStatus progress={progress} />,
                            },
                            {
                                key: 'scheduling_status',
                                value: hammer.format.Readable(progress.scheduling_status),
                            },
                            {
                                key: 'gang',
                                label: (
                                    <Tooltip content="Indicates whether operation's jobs perform a single collective computation and must be scheduled simultaneously.">
                                        <Flex alignItems="center" gap={1}>
                                            Gang <Icon data={CircleQuestionIcon} size={16} />
                                        </Flex>
                                    </Tooltip>
                                ),
                                value: isGang ? 'True' : 'False',
                            },
                            ...(isGang
                                ? [
                                      {
                                          key: 'scheduling_segment',
                                          value: hammer.format.Readable(
                                              progress.scheduling_segment,
                                          ),
                                      },
                                  ]
                                : []),
                            {
                                key: 'partitions',
                                value:
                                    progress.partitions?.completed +
                                    ' / ' +
                                    progress.partitions?.total,
                                visible: Boolean(progress.partitions),
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
            <div className={runtimeBlock()}>{map_(runtime, (tree) => this.renderTree(tree))}</div>
        );
    }
}

export default connector(Runtime);
