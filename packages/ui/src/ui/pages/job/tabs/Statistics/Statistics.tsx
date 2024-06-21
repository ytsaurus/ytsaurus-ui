import * as React from 'react';
import {useSelector} from 'react-redux';
import {getRawStatistic} from '../../../../store/selectors/job/statistics';
import {StatisticTable, StatisticTree} from '../../../../components/StatisticTable';
import {isDocsAllowed} from '../../../../config';
import UIFactory from '../../../../UIFactory';

export default function Statistics() {
    const statistic = useSelector(getRawStatistic);
    return (
        <StatisticTable
            helpUrl={isDocsAllowed() ? UIFactory.docsUrls['problems:jobstatistics'] : undefined}
            statistic={statistic as unknown as StatisticTree}
            visibleColumns={['min', 'max', 'last', 'sum', 'count']}
        />
    );
}
