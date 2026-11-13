import React from 'react';
import type {
    ErrorTreeItem,
    ErrorTreeProps,
    NavigationMetaProps,
    QueryProgressProps,
    QueryResultsProps,
    QueryStatisticsItem,
} from '@gravity-ui/querieskit';
import type {QueryExecutionTab} from '@gravity-ui/querieskit/widgets/QueryExecutionPanel';

import type {QueryItem} from '../../../../types/query-tracker/api';
import type {SourceRow} from '../../../../types/query-tracker/queryResult';
import type {QueryTab} from '../../../../store/reducers/query-tracker/queryTabsSlice';
import {Yson} from '../../../../components/Yson/Yson';
import format from '../../../../common/hammer/format';
import {parseResultTabIndex} from '../../QueryResults/helpers/parseResultTabIndex';
import {QueryDashboardCharts} from './QueryDashboardCharts';

type Options = {
    query?: QueryItem;
    sourceTabs: QueryTab[];
    results: Record<number, QueryResultsProps<SourceRow>>;
    progress: QueryProgressProps;
    metrics: QueryStatisticsItem[];
    error?: ErrorTreeItem;
    metadata: NavigationMetaProps;
    onPositionClick: ErrorTreeProps['onPositionClick'];
};

export function prepareExecutionTabs({
    query,
    sourceTabs,
    results,
    progress,
    metrics,
    error,
    metadata,
    onPositionClick,
}: Options): QueryExecutionTab<SourceRow>[] {
    if (!query?.id) return [];

    return sourceTabs.map(({id, title}) => {
        if (id.startsWith('result/')) {
            return {
                id,
                title,
                type: 'result',
                props: results[parseResultTabIndex(id) || 0] || {
                    columns: [],
                    rows: [],
                    loading: true,
                },
            };
        }
        if (id.startsWith('chart-tab/')) {
            return {
                id,
                title,
                type: 'charts',
                renderContent: ({active: chartsActive}) => (
                    <QueryDashboardCharts
                        active={chartsActive}
                        key={`${query.id}/${id}`}
                        query={query}
                        resultIndex={parseResultTabIndex(id) || 0}
                    />
                ),
            };
        }
        if (id === 'progress') {
            return {
                id,
                title,
                type: 'progress',
                props: progress,
            };
        }
        if (id === 'statistic') {
            return {
                id,
                title,
                type: 'statistics',
                props: {
                    data: metrics,
                    visibleColumns: ['min', 'max', 'avg', 'sum', 'count'],
                    fixedHeader: true,
                    virtual: false,
                    formatValue: (value, {column}) =>
                        format.Number(
                            value,
                            column === 'avg' && value !== undefined && value < 1
                                ? {significantDigits: 6}
                                : undefined,
                        ),
                },
            };
        }
        if (id === 'error') {
            return {
                id,
                type: 'info',
                props: error
                    ? {
                          root: error,
                          renderAttributes: (attributes) => (
                              <Yson value={attributes} settings={{}} />
                          ),
                          onPositionClick,
                      }
                    : undefined,
            };
        }
        return {id, title, type: 'meta', props: metadata};
    });
}
