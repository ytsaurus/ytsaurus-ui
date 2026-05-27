import React from 'react';
import {Flex, Loader, Text} from '@gravity-ui/uikit';
import {useSelector} from '../../../store/redux-hooks';
import block from 'bem-cn-lite';

import {type RootState} from '../../../store/reducers';
import {selectQueryResult} from '../../../store/selectors/query-tracker/queryResult';
import {YTErrorBlock} from '../../../components/Block/Block';
import {ResultsTable} from './ResultsTable';
import {type QueryItem} from '../../../types/query-tracker/api';
import {
    type QueryResultReadyState,
    QueryResultState,
    QueryResultsViewMode,
} from '../../../types/query-tracker/queryResult';
import {YQLSchemeTable} from './YQLSchemeTable';
import NotRenderUntilFirstVisible from '../NotRenderUntilFirstVisible/NotRenderUntilFirstVisible';
import './index.scss';
import {type ShowPreviewCallback} from './YQLTable/YQLTable';
import i18n from './i18n';
import {QueryFullResultList} from './QueryFullResultList';
import {selectQueryEngine} from '../../../store/selectors/query-tracker/query';
import {type QueryEngine} from '../../../../shared/constants/engines';
import {useShowPreviewHandler} from './hooks/useShowPreviewHandler';

const b = block('query-result-table');

function QueryReadyResultView({
    queryId,
    resultIndex,
    result,
    engine,
    onShowPreview,
}: {
    queryId: string;
    resultIndex: number;
    result: QueryResultReadyState;
    engine: QueryEngine;
    onShowPreview: ShowPreviewCallback;
}) {
    const mode = result?.settings?.viewMode;
    const total = result.meta.data_statistics.row_count;
    const truncated = result.meta.is_truncated;
    const fullResult = result.meta.full_result;
    return (
        <>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Scheme}>
                <YQLSchemeTable result={result} />
            </NotRenderUntilFirstVisible>
            <NotRenderUntilFirstVisible hide={mode !== QueryResultsViewMode.Table}>
                {fullResult && (
                    <QueryFullResultList
                        fullResult={fullResult}
                        engine={engine}
                        className={b('full-result')}
                    />
                )}
                <Flex alignItems="center" className={b('result-info')}>
                    <Text>
                        {i18n('context_rows-info', {
                            total: String(total),
                        })}
                        {truncated ? ` ${i18n('context_rows-truncated')}` : ''}
                    </Text>
                </Flex>
                <ResultsTable
                    queryId={queryId}
                    resultIndex={resultIndex}
                    result={result}
                    onShowPreview={onShowPreview}
                />
            </NotRenderUntilFirstVisible>
        </>
    );
}

export const QueryResultsView = React.memo(
    function QueryResultsView({query, index}: {query: QueryItem; index: number}) {
        const result = useSelector((state: RootState) => selectQueryResult(state, query.id, index));
        const engine = useSelector(selectQueryEngine);

        const {onShowPreview} = useShowPreviewHandler({
            queryId: query.id,
            resultIndex: index,
        });

        return (
            <div className={b()}>
                {(result?.state === QueryResultState.Init ||
                    result?.state === QueryResultState.Loading) && (
                    <div className={b('loading')}>
                        <Loader size="m" />
                    </div>
                )}
                {result?.resultReady && (
                    <>
                        <QueryReadyResultView
                            queryId={query.id}
                            resultIndex={index}
                            result={result}
                            engine={engine}
                            onShowPreview={onShowPreview}
                        />
                    </>
                )}
                {result?.state === QueryResultState.Error && <YTErrorBlock error={result.error} />}
            </div>
        );
    },
    (prev, next) => prev.query.id === next.query.id && prev.index === next.index,
);
