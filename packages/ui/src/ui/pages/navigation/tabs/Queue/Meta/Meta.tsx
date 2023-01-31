import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../../common/hammer/format';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Multimeter from '../../../../../components/Multimeter/Multimeter';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {isNull} from '../../../../../utils';

import './Meta.scss';

const block = cn('queue-meta');

interface Props {
    partitionCount?: number;
    family?: string;
    writeDataWeightRate?: TPerformanceCounters;
    writeRowCountRate?: TPerformanceCounters;
}

const Meta: React.VFC<Props> = ({
    partitionCount,
    family,
    writeDataWeightRate,
    writeRowCountRate,
}) => {
    return (
        <ErrorBoundary>
            <div className="elements-heading elements-heading_size_xs">Meta</div>
            <MetaTable
                className={block()}
                items={[
                    [
                        {
                            key: 'partition-count',
                            label: 'Partition count',
                            value: partitionCount,
                            visible: !isNull(partitionCount),
                        },
                        {
                            key: 'family',
                            label: 'Family',
                            value: family,
                            visible: !isNull(family),
                        },
                    ],
                    [
                        {
                            key: 'write-row-count-rate',
                            label: 'Rows write rate',
                            value: (
                                <Multimeter
                                    {...writeRowCountRate}
                                    show="1m"
                                    format={format.RowsPerSecond}
                                />
                            ),
                            visible: !isNull(writeRowCountRate),
                        },
                        {
                            key: 'write-data-weight-rate',
                            label: 'Data weight write rate',
                            value: (
                                <Multimeter
                                    {...writeDataWeightRate}
                                    show="1m"
                                    format={format.BytesPerSecond}
                                />
                            ),
                            visible: !isNull(writeDataWeightRate),
                        },
                    ],
                ]}
            />
        </ErrorBoundary>
    );
};

export default React.memo(Meta);
