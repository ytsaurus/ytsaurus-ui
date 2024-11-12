import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import block from 'bem-cn-lite';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Button, Flex, Icon, Loader} from '@gravity-ui/uikit';

import playIcon from '../../../assets/img/svg/play.svg';
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
import {isSupportedQtACO} from '../module/query_aco/selectors';
import {QueryACOSelect} from '../QueryACO/QueryACOSelect';
import {useQueryACO} from '../QueryACO/useQueryACO';
import {useMonaco} from '../hooks/useMonaco';
import {QueryEngine} from '../module/engines';
import {MonacoLanguage} from '../../../constants/monaco';
import hammer from '../../../common/hammer';
import {updateTitle} from '../../../store/actions/global';
import {EditQueryACOModal} from '../QueryACO/EditQueryACOModal/EditQueryACOModal';
import {ShareButton} from '../QueryResults/ShareButton';
import {WaitForFont} from '../../../containers/WaitForFont/WaitForFont';

const b = block('query-container');

const getLanguageByEngine = (engine: QueryEngine): MonacoLanguage => {
    switch (engine) {
        case QueryEngine.CHYT:
            return MonacoLanguage.CHYT;
        case QueryEngine.SPYT:
            return MonacoLanguage.SPYT;
        case QueryEngine.YT_QL:
            return MonacoLanguage.YTQL;
        default:
            return MonacoLanguage.YQL;
    }
};

const QueryEditorView = React.memo(function QueryEditorView({
    onStartQuery,
}: {
    onStartQuery?: (queryId: string) => boolean | void;
}) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const activeQuery = useSelector(getQuery);
    const text = useSelector(getQueryText);
    const engine = useSelector(getQueryEngine);
    const editorErrors = useSelector(getQueryEditorErrors);
    const isACOSupported = useSelector(isSupportedQtACO);
    const dispatch = useDispatch();
    const decorationsCollection = useRef<monaco.editor.IEditorDecorationsCollection | undefined>(
        undefined,
    );
    const model = editorRef.current?.getModel();

    const runQueryCallback = useCallback(() => {
        dispatch(runQuery(onStartQuery));
    }, [dispatch, onStartQuery]);

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [editorRef.current, activeQuery?.id]);

    useEffect(() => {
        if (editorRef.current) {
            setEditor('queryEditor', editorRef.current);
        }
    }, [setEditor]);

    useEffect(() => {
        const runQueryByKey = (e: KeyboardEvent) => {
            const isCtrlOrMetaPressed = e.ctrlKey || e.metaKey;
            const isEnterOrEKeyPressed = e.key === 'Enter' || e.key === 'e';
            const isF8KeyPressed = e.key === 'F8';

            if ((isCtrlOrMetaPressed && isEnterOrEKeyPressed) || isF8KeyPressed) {
                e.preventDefault();
                e.stopPropagation();
                runQueryCallback();
            }
        };

        document.addEventListener('keydown', runQueryByKey, true);
        return () => {
            document.removeEventListener('keydown', runQueryByKey, true);
        };
    }, [runQueryCallback]);

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

    const updateQueryText = useCallback(
        function (text: string) {
            dispatch(updateQueryDraft({query: text, error: undefined}));
        },
        [dispatch],
    );

    const validateQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'validate'}));
        },
        [dispatch, onStartQuery],
    );

    const explainQueryCallback = useCallback(
        function () {
            dispatch(runQuery(onStartQuery, {execution_mode: 'optimize'}));
        },
        [dispatch, onStartQuery],
    );

    return (
        <div className={b('query')}>
            <WaitForFont>
                <MonacoEditor
                    editorRef={editorRef}
                    value={text || ''}
                    language={getLanguageByEngine(engine)}
                    className={b('editor')}
                    onChange={updateQueryText}
                    monacoConfig={monacoConfig}
                />
            </WaitForFont>
            <div className={b('actions')}>
                <div className="query-run-action">
                    <Button qa="qt-run" view="action" onClick={runQueryCallback}>
                        <Icon data={playIcon} />
                        Run
                    </Button>
                    {engine === QueryEngine.YQL ? (
                        <>
                            <Button qa="qt-validate" onClick={validateQueryCallback}>
                                Validate
                            </Button>
                            <Button qa="qt-explain" onClick={explainQueryCallback}>
                                Explain
                            </Button>
                        </>
                    ) : null}
                    {isACOSupported && <QueryACOSelect />}
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
                    <Flex gap={2} className={b('results-toolbar-buttons')}>
                        <ShareButton />
                        <EditQueryACOModal query_id={query.id} />
                    </Flex>
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
    showStatusInTitle,
}: {
    onStartQuery?: (queryId: string) => boolean | void;
    showStatusInTitle?: boolean;
}) {
    const dispatch = useDispatch();
    const query = useCurrentQuery();
    const {isQueryTrackerInfoLoading} = useQueryACO();

    const [resultViewMode, setResultViewMode] = useState<ResultMode>('minimized');

    const [partSizes, setSize] = useState([50, 50]);

    useEffect(() => {
        if (!query || !showStatusInTitle) return;

        const startDate = query.start_time
            ? hammer.format['DateTime'](query.start_time, {format: 'short'})
            : '';
        const title = query.annotations?.title || '';
        const state = query.state?.toUpperCase() || '';

        if (startDate || title || state) {
            dispatch(
                updateTitle({
                    path: `${title} ${state} ${startDate} @ ${query.engine}`,
                }),
            );
        }
    }, [dispatch, query]);

    useEffect(() => {
        setResultViewMode('split');
    }, [query?.id]);

    const isExecuted = useSelector(isQueryExecuted);
    const isMainQueryLoading = useSelector(isQueryLoading);
    const isLoading = isQueryTrackerInfoLoading || isMainQueryLoading;

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
