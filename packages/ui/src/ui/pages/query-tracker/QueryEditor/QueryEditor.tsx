import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import block from 'bem-cn-lite';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Button, Icon, Loader} from '@gravity-ui/uikit';

import playIcon from '../../../../../img/svg/play.svg';
import {useDispatch, useSelector} from 'react-redux';
import {
    getQuery,
    getQueryEditorErrors,
    getQueryEngine,
    getQueryText,
    isQueryExecuted,
    isQueryLoading,
} from '../module/query/selectors';
import {runQuery, updateQueryDraft} from '../module/query/actions';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import {QueryResults} from '../QueryResults';
import SquareIcon from '@gravity-ui/icons/svgs/square.svg';
import LayoutFooterIcon from '@gravity-ui/icons/svgs/layout-footer.svg';

import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';

import './QueryEditor.scss';
import {QueryItem} from '../module/api';
import {useCurrentQuery} from '../QueryResults/hooks/useCurrentQuery';
import forEach_ from 'lodash/forEach';
import uniqBy_ from 'lodash/uniqBy';

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
    const editorErrors = useSelector(getQueryEditorErrors);
    const decorationsCollection = useRef<monaco.editor.IEditorDecorationsCollection | undefined>(
        undefined,
    );
    const model = editorRef.current?.getModel();

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [editorRef.current, activeQuery?.id]);

    useEffect(
        function updateErrorMarkers() {
            if (model) {
                const markers: monaco.editor.IMarkerData[] = [];
                const decorations: monaco.editor.IModelDeltaDecoration[] = [];
                forEach_(editorErrors, (error) => {
                    const {attributes, message} = error;
                    const range = new monaco.Range(
                        attributes.start_position.row,
                        attributes.start_position.column,
                        attributes.end_position.row,
                        attributes.end_position.column,
                    );
                    const {startLineNumber, startColumn, endLineNumber, endColumn} = range;
                    const marker: monaco.editor.IMarkerData = {
                        message: message,
                        severity: monaco.MarkerSeverity.Error,
                        startLineNumber,
                        startColumn,
                        endLineNumber,
                        endColumn,
                    };
                    markers.push(marker);
                    const line = {
                        range: range,
                        options: {
                            isWholeLine: true,
                            className: b('error-line'),
                        },
                    };
                    decorations.push(line);
                });
                monaco.editor.setModelMarkers(model, 'query-tracker', markers);
                decorationsCollection.current?.clear();
                decorationsCollection.current = editorRef.current?.createDecorationsCollection(
                    uniqBy_(decorations, (d) => d.range.startLineNumber),
                );
            }
        },
        [editorErrors, model],
    );

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
            dispatch(updateQueryDraft({query: text, error: undefined}));
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
                        qa="qt-run"
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
                            <Icon data={SquareIcon} size={16} />
                        </Button>
                    ) : (
                        <Button
                            className={b('meta-action')}
                            view="flat"
                            onClick={() => setResultViewMode('split')}
                        >
                            <Icon data={LayoutFooterIcon} size={16} />
                        </Button>
                    )}
                    {resultViewMode !== 'minimized' && (
                        <Button
                            className={b('meta-action')}
                            view="flat"
                            onClick={() => setResultViewMode('minimized')}
                        >
                            <Icon data={XmarkIcon} size={16} />
                        </Button>
                    )}
                </>
            }
        />
    );
});

type ResultMode = 'full' | 'minimized' | 'split';
export default function QueryEditor({
    onStartQuery,
}: {
    onStartQuery?: (queryId: string) => boolean | void;
}) {
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
