import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../../store/redux-hooks';

import format from '../../../../../common/hammer/format';
import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import Label from '../../../../../components/Label';
import {MetaTable} from '@ytsaurus/components';
import Multimeter from '../../../../../components/Multimeter/Multimeter';
import {SubjectCard} from '../../../../../components/SubjectLink/SubjectLink';

import {type TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {isNullable} from '../../../../../utils';
import {selectTargetQueue} from '../../../../../store/selectors/navigation/tabs/consumer';

import i18n from './i18n';
import './Meta.scss';

const block = cn('consumer-meta');

interface Props {
    targetQueue?: string;
    owner?: string;
    partitionCount?: number;
    readDataWeightRate?: TPerformanceCounters;
    readRowCountRate?: TPerformanceCounters;
}

const Meta: React.FC<Props> = ({owner, partitionCount, readDataWeightRate, readRowCountRate}) => {
    const {vital} = useSelector(selectTargetQueue) ?? {};

    return (
        <ErrorBoundary>
            <div className={block('header')}>
                <div className={block('header-title', 'elements-heading elements-heading_size_xs')}>
                    {i18n('title_meta')}
                </div>
            </div>
            <MetaTable
                className={block()}
                items={[
                    [
                        {
                            key: 'owner',
                            label: i18n('field_owner'),
                            value: owner && <SubjectCard name={owner} />,
                            visible: !isNullable(owner),
                        },
                    ],
                    [
                        {
                            key: 'vital',
                            label: i18n('field_vital'),
                            value: (
                                <Label
                                    theme="default"
                                    text={vital ? i18n('value_true') : i18n('value_false')}
                                />
                            ),
                            visible: !isNullable(vital),
                        },
                        {
                            key: 'partition-count',
                            label: i18n('field_partition-count'),
                            value: partitionCount,
                            visible: !isNullable(partitionCount),
                        },
                    ],
                    [
                        {
                            key: 'read-data-weight-rate',
                            label: i18n('field_data-weight-read-rate'),
                            value: (
                                <Multimeter
                                    {...readDataWeightRate}
                                    show="1m"
                                    format={format.BytesPerSecond}
                                />
                            ),
                            visible: !isNullable(readDataWeightRate),
                        },
                        {
                            key: 'read-row-count-rate',
                            label: i18n('field_rows-read-rate'),
                            value: (
                                <Multimeter
                                    {...readRowCountRate}
                                    show="1m"
                                    format={format.RowsPerSecond}
                                />
                            ),
                            visible: !isNullable(readRowCountRate),
                        },
                    ],
                ]}
            />
        </ErrorBoundary>
    );
};

export default React.memo(Meta);
