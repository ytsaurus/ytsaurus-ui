import * as React from 'react';
import {useSelector} from 'react-redux';
import {getRawStatistic} from '../../../../store/selectors/job/statistics';
import {StatisticTable, StatisticTree} from '../../../../components/StatisticTable';

export default function Statistics() {
    const statistic = useSelector(getRawStatistic);

    return (
        <StatisticTable
            statistic={statistic as unknown as StatisticTree}
            visibleColumns={['min', 'max', 'last', 'sum', 'count']}
        />
    );
}
