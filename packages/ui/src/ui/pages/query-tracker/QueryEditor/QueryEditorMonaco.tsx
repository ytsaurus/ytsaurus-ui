import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as monaco from 'monaco-editor';
import {useMonaco} from '../hooks/useMonaco';
import {useDispatch, useSelector} from 'react-redux';
import {
    getQueryEditorErrors,
    getQueryEngine,
    getQueryId,
    getQueryText,
    isQueryLoading,
} from '../module/query/selectors';
import {useMonacoQuerySuggestions} from '../querySuggestionsModule/useMonacoQuerySuggestions';
import {updateQueryDraft} from '../module/query/actions';
import forEach_ from 'lodash/forEach';
import {getHashLineNumber} from './helpers/getHashLineNumber';
import {makeHighlightedLineDecorator} from './helpers/makeHighlightedLineDecorator';
import uniqBy_ from 'lodash/uniqBy';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import {getDecorationsWithoutHighlight} from './helpers/getDecorationsWithoutHighlight';
import {WaitForFont} from '../../../containers/WaitForFont/WaitForFont';
import cn from 'bem-cn-lite';
import {getLanguageByEngine} from './helpers/getLanguageByEngine';
import './QueryEditorMonaco.scss';

const b = cn('yq-query-editor-monaco');

export const QueryEditorMonaco: FC = () => {
    const [changed, setChanged] = useState(false);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const {setEditor} = useMonaco();
    const id = useSelector(getQueryId);
    const text = useSelector(getQueryText);
    const engine = useSelector(getQueryEngine);
    const editorErrors = useSelector(getQueryEditorErrors);
    const loading = useSelector(isQueryLoading);
    const dispatch = useDispatch();
    const decorationsCollection = useRef<monaco.editor.IEditorDecorationsCollection | undefined>(
        undefined,
    );
    const model = editorRef.current?.getModel();
    useMonacoQuerySuggestions(editorRef.current);

    useEffect(() => {
        editorRef.current?.focus();
        editorRef.current?.setScrollTop(0);
    }, [id]);

    useEffect(() => {
        if (editorRef.current) {
            setEditor('queryEditor', editorRef.current);
        }
    }, [setEditor]);

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

                const lineNumber = getHashLineNumber();
                if (!loading && lineNumber && !changed) {
                    decorations.push(makeHighlightedLineDecorator(model, lineNumber));
                }

                decorationsCollection.current?.clear();
                decorationsCollection.current = editorRef.current?.createDecorationsCollection(
                    uniqBy_(decorations, (d) => d.range.startLineNumber),
                );
            }
        },
        [editorErrors, loading, model],
    );

    const monacoConfig = useMemo<MonacoEditorConfig>(() => {
        return {
            fontSize: 14,
            language: engine,
            renderWhitespace: 'boundary',
            minimap: {
                enabled: true,
            },
            inlineSuggest: {
                enabled: true,
                showToolbar: 'always',
                mode: 'subword',
                keepOnBlur: true,
            },
        };
    }, [engine]);

    const handleLineNumberClick = useCallback(
        ({target}: monaco.editor.IEditorMouseEvent) => {
            if (target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS || !model) return;

            const lineNumber = (target.element as HTMLDivElement).dataset.number;
            if (!lineNumber) {
                editorRef.current?.setSelection(new monaco.Selection(0, 0, 0, 0));
                return;
            }

            const newUrl = new URL(window.location.href);
            newUrl.hash = `#L${lineNumber}`;
            window.history.pushState(null, '', newUrl.toString());

            const otherDecorations = getDecorationsWithoutHighlight(model, editorRef.current);
            decorationsCollection.current?.clear();
            decorationsCollection.current?.set([
                ...otherDecorations,
                makeHighlightedLineDecorator(model, parseInt(lineNumber, 10)),
            ]);
            editorRef.current?.setSelection(new monaco.Selection(0, 0, 0, 0));
        },
        [model],
    );

    const updateQueryText = useCallback(
        function (query: string) {
            setChanged(true);
            dispatch(updateQueryDraft({query, error: undefined}));
        },
        [dispatch],
    );

    return (
        <WaitForFont>
            <MonacoEditor
                editorRef={editorRef}
                value={text || ''}
                language={getLanguageByEngine(engine)}
                className={b()}
                onChange={updateQueryText}
                onClick={handleLineNumberClick}
                monacoConfig={monacoConfig}
            />
        </WaitForFont>
    );
};
