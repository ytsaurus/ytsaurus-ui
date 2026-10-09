import React, {useEffect, useMemo, useRef, useState} from 'react';
import {DashboardCharts} from '@gravity-ui/querieskit/widgets/DashboardCharts';
import {Button, Flex, Loader, Text} from '@gravity-ui/uikit';

import type {QueryItem} from '../../../../types/query-tracker/api';
import type {ResultDashboardConfig} from '../../../../types/query-tracker/dashboardCharts';
import {QueryResultState} from '../../../../types/query-tracker/queryResult';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectQueryResults} from '../../../../store/selectors/query-tracker/queryResult';
import {selectCurrentUserName} from '../../../../store/selectors/global/username';
import {loadQueryResult} from '../../../../store/actions/query-tracker/queryResult';
import {saveQueryDashboardConfig} from '../../../../store/actions/query-tracker/queryDashboard';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import {
    dashboardChartTypes,
    describeDashboardItems,
    prepareChartFields,
    prepareDashboardLayout,
    readDashboardConfig,
    restoreDashboardItems,
} from '../../../../utils/query-tracker/dashboardCharts';
import i18n from './i18n';

const emptyRows: [] = [];

export function QueryDashboardCharts({
    query,
    resultIndex,
}: {
    query: QueryItem;
    resultIndex: number;
}) {
    const dispatch = useDispatch();
    const result = useSelector((state) => selectQueryResults(state, query.id)?.[resultIndex]);
    const user = useSelector(selectCurrentUserName);
    const canSave = user === query.user;
    const [config, setConfig] = useState<ResultDashboardConfig>(
        () =>
            readDashboardConfig(query.annotations?.dashboardChartsConfig).results[resultIndex] || {
                charts: [],
                layout: [],
            },
    );
    const configRef = useRef(config);
    const edited = useRef(false);
    const revision = useRef(0);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
    const rows = result?.resultReady ? result.results : emptyRows;
    const prepared = useMemo(() => prepareChartFields(rows), [rows]);
    const items = useMemo(
        () => restoreDashboardItems(config.charts, prepared),
        [config.charts, prepared],
    );
    const layout = useMemo(
        () =>
            prepareDashboardLayout(
                items.map(({id}) => id),
                config.layout,
            ),
        [items, config.layout],
    );

    useEffect(() => {
        dispatch(loadQueryResult(query.id, resultIndex));
    }, [dispatch, query.id, resultIndex]);

    useEffect(() => {
        // A save from a previous mount can finish after switching back to the new view.
        // Apply it until this instance has local edits of its own.
        if (edited.current) return;
        const next = readDashboardConfig(query.annotations?.dashboardChartsConfig).results[
            resultIndex
        ] || {
            charts: [],
            layout: [],
        };
        if (JSON.stringify(next) !== JSON.stringify(configRef.current)) {
            configRef.current = next;
            setConfig(next);
        }
    }, [query.annotations?.dashboardChartsConfig, resultIndex]);

    const save = (next: ResultDashboardConfig) => {
        if (!canSave) return;
        const currentRevision = ++revision.current;
        setSaveState('saving');
        dispatch(saveQueryDashboardConfig(query.id, resultIndex, next)).then(
            () => {
                if (revision.current === currentRevision) setSaveState('saved');
            },
            () => {
                if (revision.current === currentRevision) setSaveState('error');
            },
        );
    };
    const change = (patch: Partial<ResultDashboardConfig>) => {
        const next = {...configRef.current, ...patch};
        if (JSON.stringify(next) === JSON.stringify(configRef.current)) return;
        edited.current = true;
        configRef.current = next;
        setConfig(next);
        save(next);
    };

    if (result?.state === QueryResultState.Error) return <YTErrorBlock error={result.error} />;
    if (!result?.resultReady) return <Loader />;

    return (
        <Flex direction="column" gap={2} height="100%" style={{minHeight: 0}}>
            {!canSave && <Text color="secondary">{i18n('context_charts-author-only')}</Text>}
            {(result.meta.is_truncated || rows.length < result.meta.data_statistics.row_count) && (
                <Text color="secondary">{i18n('context_charts-truncated')}</Text>
            )}
            {saveState === 'saving' && (
                <Text color="secondary">{i18n('context_charts-saving')}</Text>
            )}
            {saveState === 'error' && (
                <Flex gap={2} alignItems="center">
                    <Text color="danger">{i18n('context_charts-save-error')}</Text>
                    <Button onClick={() => save(configRef.current)}>
                        {i18n('action_charts-retry')}
                    </Button>
                </Flex>
            )}
            {items.length < config.charts.length && (
                <Text color="secondary">{i18n('context_charts-missing-columns')}</Text>
            )}
            <DashboardCharts
                editorMode="fields"
                chartFieldsEditorProps={{
                    ...prepared,
                    chartTypeOptions: dashboardChartTypes.map((value) => ({
                        value,
                        content: i18n(`value_chart-${value}`),
                    })),
                }}
                chartItems={items}
                defaultLayout={layout}
                emptyTitle={i18n('context_charts-empty')}
                emptyDescription={
                    rows.length &&
                    prepared.getFieldOptions({chartType: 'line', role: 'measure'}).length
                        ? i18n('context_charts-add')
                        : i18n('context_charts-no-data')
                }
                onItemsChange={(nextItems) => {
                    const visible = new Set(items.map(({id}) => id));
                    const unavailable = configRef.current.charts.filter(({id}) => !visible.has(id));
                    const charts = [...describeDashboardItems(nextItems), ...unavailable];
                    change({
                        charts,
                        layout: prepareDashboardLayout(
                            charts.map(({id}) => id),
                            configRef.current.layout,
                        ),
                    });
                }}
                onLayoutChange={(nextLayout) => {
                    const updated = new Set(nextLayout.map(({i}) => i));
                    change({
                        layout: prepareDashboardLayout(
                            configRef.current.charts.map(({id}) => id),
                            [
                                ...configRef.current.layout.filter(({i}) => !updated.has(i)),
                                ...nextLayout.map(({i, x, y, w, h}) => ({i, x, y, w, h})),
                            ],
                        ),
                    });
                }}
            />
        </Flex>
    );
}
