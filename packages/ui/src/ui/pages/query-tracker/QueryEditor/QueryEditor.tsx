import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor/MonacoEditor';
import block from 'bem-cn-lite';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Button, Icon, Loader} from '@gravity-ui/uikit';

import playIcon from '../../../../../img/svg/play.svg';
import {useDispatch, useSelector} from 'react-redux';
import {
    getQuery,
    getQueryEngine,
    getQueryText,
    isQueryExecuted,
    isQueryLoading,
} from '../module/query/selectors';
import {SET_QUERY_PATCH, runQuery} from '../module/query/actions';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import {QueryResults} from '../QueryResults';
import maximizeBlockIcon from '../../../../../img/svg/square.svg';
import minimazeBlockIcon from '../../../../../img/svg/square-semifill.svg';
import closeIcon from '../../../../../img/svg/close-icon.svg';

import './QueryEditor.scss';
import {QueryItem} from '../module/api';
import {useCurrentQuery} from '../QueryResults/hooks/useCurrentQuery';

const b = block('query-container');

const QueryEditorView = React.memo(function QueryEditorView({
    onStartQuery,
}: {
    onStartQuery?: (queryId: string) => boolean | void;
}) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const activeQuery = useSelector(getQuery);
    const text = useSelector(getQueryText);
    const engine = useSelector(getQueryEngine);

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [editorRef.current, activeQuery?.id]);

    const monacoConfig = useMemo<MonacoEditorConfig>(() => {
        return {
            fontSize: 14,
            language: engine,
            renderWhitespace: 'boundary',
            minimap: {
                enabled: true,
            },
        };
    }, [engine]);
    const dispatch = useDispatch();
    const upadteQueryText = useCallback(
        function (text: string) {
            dispatch({type: SET_QUERY_PATCH, data: {query: text}});
        },
        [dispatch],
    );

    const runQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery));
        },
        [dispatch, onStartQuery],
    );
    return (
        <div className={b('query')}>
            <MonacoEditor
                editorRef={editorRef}
                value={text || ''}
                language={'yql'}
                className={b('editor')}
                onChange={upadteQueryText}
                monacoConfig={monacoConfig}
            />
            <div className={b('actions')}>
                <div className="query-run-action">
                    <Button
                        className="query-run-action-button"
                        view="action"
                        onClick={runQueryCallback}
                    >
                        <Icon data={playIcon} />
                        Run
                    </Button>
                </div>
            </div>
        </div>
    );
});

const ResultView = React.memo(function ResultView({
    query,
    resultViewMode,
    setResultViewMode,
}: {
    query: QueryItem;
    resultViewMode: ResultMode;
    setResultViewMode: (v: ResultMode) => void;
}) {
    return (
        <QueryResults
            query={query}
            className={b('results')}
            minimized={resultViewMode === 'minimized'}
            toolbar={
                <>
                    {resultViewMode === 'split' ? (
                        <Button
                            className={b('meta-action')}
                            view="flat"
                            onClick={() => setResultViewMode('full')}
                        >
                            <Icon data={maximizeBlockIcon} />
                        </Button>
                    ) : (
                        <Button
                            className={b('meta-action')}
                            view="flat"
                            onClick={() => setResultViewMode('split')}
                        >
                            <Icon data={minimazeBlockIcon} />
                        </Button>
                    )}
                    {resultViewMode !== 'minimized' && (
                        <Button
                            className={b('meta-action')}
                            view="flat"
                            onClick={() => setResultViewMode('minimized')}
                        >
                            <Icon data={closeIcon} />
                        </Button>
                    )}
                </>
            }
        />
    );
});

type ResultMode = 'full' | 'minimized' | 'split';
export function QueryEditor({onStartQuery}: {onStartQuery?: (queryId: string) => boolean | void}) {
    const query = useCurrentQuery();

    const [resultViewMode, setResultViewMode] = useState<ResultMode>('minimized');

    const [partSizes, setSize] = useState([50, 50]);

    useEffect(() => {
        setResultViewMode('split');
    }, [query?.id]);

    const isExecuted = useSelector(isQueryExecuted);
    const isLoading = useSelector(isQueryLoading);

    return (
        <>
            {isLoading && (
                <div className={b('loading')}>
                    <Loader />
                </div>
            )}
            <FlexSplitPane
                className={b({[resultViewMode]: true})}
                direction={FlexSplitPane.VERTICAL}
                onResizeEnd={setSize}
                getInitialSizes={() => partSizes}
            >
                {resultViewMode !== 'full' && <QueryEditorView onStartQuery={onStartQuery} />}

                {query?.id && isExecuted && (
                    <ResultView
                        query={query}
                        setResultViewMode={setResultViewMode}
                        resultViewMode={resultViewMode}
                    />
                )}
            </FlexSplitPane>
        </>
    );
}
