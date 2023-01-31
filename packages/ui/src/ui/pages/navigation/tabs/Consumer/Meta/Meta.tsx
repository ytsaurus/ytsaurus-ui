import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../../common/hammer/format';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Label from '../../../../../components/Label/Label';
import Link from '../../../../../components/Link/Link';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Multimeter from '../../../../../components/Multimeter/Multimeter';
import {UserCard} from '../../../../../components/UserLink/UserLink';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {isNull} from '../../../../../utils';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';

import './Meta.scss';

const block = cn('consumer-meta');

interface Props {
    targetQueue?: string;
    owner?: string;
    vital?: boolean;
    partitionCount?: number;
    readDataWeightRate?: TPerformanceCounters;
    readRowCountRate?: TPerformanceCounters;
}

const Meta: React.VFC<Props> = ({
    targetQueue,
    owner,
    vital,
    partitionCount,
    readDataWeightRate,
    readRowCountRate,
}) => {
    let clusterQueueUrl;
    if (targetQueue) {
        const [cluster, path] = targetQueue.split(':');
        clusterQueueUrl = genNavigationUrl(cluster, path);
    }

    return (
        <ErrorBoundary>
            <div className="elements-heading elements-heading_size_xs">Meta</div>
            <MetaTable
                className={block()}
                items={[
                    [
                        {
                            key: 'target-queue',
                            label: 'Target queue',
                            value: (
                                <Link url={clusterQueueUrl} routed>
                                    {targetQueue}
                                </Link>
                            ),
                            visible: !isNull(targetQueue),
                        },
                        {
                            key: 'owner',
                            label: 'Owner',
                            value: owner && <UserCard userName={owner} />,
                            visible: !isNull(owner),
                        },
                    ],
                    [
                        {
                            key: 'vital',
                            label: 'Vital',
                            value: <Label theme="default" text={vital ? 'True' : 'False'} />,
                            visible: !isNull(vital),
                        },
                        {
                            key: 'partition_count',
                            label: 'Partition count',
                            value: partitionCount,
                            visible: !isNull(partitionCount),
                        },
                    ],
                    [
                        {
                            key: 'read-data-weight-rate',
                            label: 'Data weight read rate',
                            value: (
                                <Multimeter
                                    {...readDataWeightRate}
                                    show="1m"
                                    format={format.BytesPerSecond}
                                />
                            ),
                            visible: !isNull(readDataWeightRate),
                        },
                        {
                            key: 'read-row-count-rate',
                            label: 'Rows read rate',
                            value: (
                                <Multimeter
                                    {...readRowCountRate}
                                    show="1m"
                                    format={format.RowsPerSecond}
                                />
                            ),
                            visible: !isNull(readRowCountRate),
                        },
                    ],
                ]}
            />
        </ErrorBoundary>
    );
};

export default React.memo(Meta);
