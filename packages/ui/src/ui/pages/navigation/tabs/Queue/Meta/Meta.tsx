import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../../common/hammer/format';
import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import {ClipboardButton, MetaTable} from '@ytsaurus/components';
import Multimeter from '../../../../../components/Multimeter/Multimeter';
import {type TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {isNullable} from '../../../../../utils';

import i18n from './i18n';
import './Meta.scss';

const block = cn('queue-meta');

interface Props {
    partitionCount?: number;
    family?: string;
    queueAgentHost?: string;
    writeDataWeightRate?: TPerformanceCounters;
    writeRowCountRate?: TPerformanceCounters;
}

const Meta: React.VFC<Props> = ({
    partitionCount,
    family,
    queueAgentHost,
    writeDataWeightRate,
    writeRowCountRate,
}) => {
    return (
        <ErrorBoundary>
            <div className="elements-heading elements-heading_size_xs">{i18n('title_meta')}</div>
            <MetaTable
                className={block()}
                items={[
                    [
                        {
                            key: 'partition-count',
                            label: i18n('field_partition-count'),
                            value: partitionCount,
                            visible: !isNullable(partitionCount),
                        },
                        {
                            key: 'family',
                            label: i18n('field_family'),
                            value: family,
                            visible: !isNullable(family),
                        },
                        {
                            key: 'queue-agent-host',
                            label: i18n('field_queue-agent-host'),
                            value: (
                                <span className={block('queue-agent-host')}>
                                    {queueAgentHost}
                                    <ClipboardButton
                                        text={queueAgentHost}
                                        view="flat-secondary"
                                        inlineMargins
                                    />
                                </span>
                            ),
                            visible: !isNullable(queueAgentHost),
                        },
                    ],
                    [
                        {
                            key: 'write-row-count-rate',
                            label: i18n('field_write-row-count-rate'),
                            value: (
                                <Multimeter
                                    {...writeRowCountRate}
                                    show="1m"
                                    format={format.RowsPerSecond}
                                />
                            ),
                            visible: !isNullable(writeRowCountRate),
                        },
                        {
                            key: 'write-data-weight-rate',
                            label: i18n('field_write-data-weight-rate'),
                            value: (
                                <Multimeter
                                    {...writeDataWeightRate}
                                    show="1m"
                                    format={format.BytesPerSecond}
                                />
                            ),
                            visible: !isNullable(writeDataWeightRate),
                        },
                    ],
                ]}
            />
        </ErrorBoundary>
    );
};

export default React.memo(Meta);
