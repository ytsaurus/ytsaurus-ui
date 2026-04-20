import * as React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {selectRawStatistic} from '../../../../store/selectors/job/statistics';
import {selectOperationStatisticsDescription} from '../../../../store/selectors/global/supported-features';
import {StatisticTable, type StatisticTree} from '../../../../components/StatisticTable';
import {isDocsAllowed} from '../../../../config';
import UIFactory from '../../../../UIFactory';

import './Statistics.scss';

const block = cn('yt-job-statistics');

export default function Statistics() {
    const statistic = useSelector(selectRawStatistic);
    const {getStatisticInfo} = useSelector(selectOperationStatisticsDescription);
    return (
        <StatisticTable
            className={block()}
            helpUrl={isDocsAllowed() ? UIFactory.docsUrls['problems:jobstatistics'] : undefined}
            statistic={statistic as unknown as StatisticTree}
            visibleColumns={['min', 'max', 'last', 'sum', 'count']}
            getStatisticInfo={getStatisticInfo}
        />
    );
}
