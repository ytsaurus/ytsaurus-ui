import {useSelector} from 'react-redux';
import React from 'react';

import {getProgressYQLStatistics} from '../../module/query/selectors';
import {StatisticTable, StatisticTree} from '../../../../components/StatisticTable';

import './index.scss';

export function YQLStatisticsTable() {
    const statistics = useSelector(getProgressYQLStatistics);

    return (
        <StatisticTable
            fixedHeader
            virtual={false}
            statistic={statistics as StatisticTree}
            visibleColumns={['min', 'max', 'avg', 'sum', 'count']}
        />
    );
}
