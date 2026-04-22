import {useSelector} from '../../../../store/redux-hooks';
import React from 'react';

import {selectProgressYQLStatistics} from '../../../../store/selectors/query-tracker/query';
import {StatisticTable, type StatisticTree} from '../../../../components/StatisticTable';

import './index.scss';

export function YQLStatisticsTable() {
    const statistics = useSelector(selectProgressYQLStatistics);

    if (!statistics) {
        return null;
    }

    return (
        <StatisticTable
            fixedHeader
            virtual={false}
            statistic={statistics as StatisticTree}
            visibleColumns={['min', 'max', 'avg', 'sum', 'count']}
        />
    );
}
