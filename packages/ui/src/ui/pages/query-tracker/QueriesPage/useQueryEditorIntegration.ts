import {useCallback, useEffect, useMemo, useState} from 'react';
import * as monaco from 'monaco-editor';
import key from 'hotkeys-js';
// @ts-ignore The package does not ship declarations for this entrypoint.
import {initVimMode} from 'monaco-vim/src';
import {
    type EditorExtension,
    type EditorProviders,
    type MonacoEditorIntegrationProps,
    createQueryEditorPreset,
} from '@gravity-ui/querieskit';
import {QueryEngine} from '../../../../shared/constants/engines';
import {createInlineSuggestions} from '../querySuggestionsModule/createInlineSuggestions';
import {getQueryTableSchema, listQueryPathChildren} from './queryEditorCatalog';
import {createProvideSuggestionsFunction} from '../../../libs/monaco-yql-languages/helpers/createProvideSuggestionsFunction';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectQueryDraft,
    selectQueryEditorErrors,
} from '../../../store/selectors/query-tracker/query';
import {selectSettingsEditorVimMode} from '../../../store/selectors/settings/settings-ts';
import {openPath} from '../../../store/actions/query-tracker/queryNavigation';
import {monacoEditorsRegistry} from '../context/monacoEditorsRegistry';
import {getHashLineNumber} from '../QueryEditor/helpers/getHashLineNumber';
import {useMonacoQuerySuggestions} from '../querySuggestionsModule/useMonacoQuerySuggestions';

export function useQueryEditorIntegration({
    active,
    onRun,
    runDisabled,
}: {
    active: boolean;
    onRun: () => void;
    runDisabled: boolean;
}): MonacoEditorIntegrationProps {
    const dispatch = useDispatch();
    const draft = useSelector(selectQueryDraft);
    const errors = useSelector(selectQueryEditorErrors);
    const vim = useSelector(selectSettingsEditorVimMode);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [highlightedLine, setHighlightedLine] = useState<number | undefined>(
        () => getHashLineNumber() ?? undefined,
    );
    const preset = useMemo(
        () =>
            createQueryEditorPreset({
                listPathChildren: listQueryPathChildren,
                getTableSchema: getQueryTableSchema,
                onReferenceClick: ({identifier, clusterId}) => {
                    const path = identifier.replace(/^ytTable:/, '');
                    if (path.startsWith('//'))
                        dispatch(openPath(path, clusterId || draft.settings?.cluster || null));
                },
            }),
        [dispatch, draft.settings?.cluster],
    );
    const providers = useMemo<EditorProviders>(
        () => ({
            // CHYT queries address Cypress paths, while the standard ClickHouse preset
            // assumes a database catalog. Keep its YT completion adapter model-local.
            completion:
                draft.engine === QueryEngine.CHYT
                    ? {
                          mode: 'replace',
                          provider: {
                              triggerCharacters: ['`', ':', '/', ' '],
                              provideCompletionItems: async (...args) => {
                                  const {parseClickHouseQuery} = await import(
                                      /* webpackChunkName: "clickhouse-autocomplete" */ '@gravity-ui/websql-autocomplete/clickhouse'
                                  );
                                  return createProvideSuggestionsFunction(
                                      parseClickHouseQuery,
                                      QueryEngine.CHYT,
                                  )(...args);
                              },
                          },
                      }
                    : undefined,
            inlineCompletion:
                draft.engine === QueryEngine.YQL || draft.engine === QueryEngine.CHYT
                    ? {
                          mode: 'replace',
                          provider: {
                              provideInlineCompletions: createInlineSuggestions(draft.engine),
                              disposeInlineCompletions: () => {},
                          },
                      }
                    : false,
        }),
        [draft.engine],
    );
    useMonacoQuerySuggestions(editor ?? undefined);

    const editorRef = useCallback((instance: monaco.editor.IStandaloneCodeEditor | null) => {
        setEditor(instance);
    }, []);
    useEffect(() => {
        if (!editor) return undefined;
        monacoEditorsRegistry.set('queryEditor', editor);
        editor.focus();
        const line = getHashLineNumber();
        if (line) editor.revealLineInCenter(line);
        return () => {
            if (monacoEditorsRegistry.get('queryEditor') === editor)
                monacoEditorsRegistry.delete('queryEditor');
        };
    }, [editor]);
    useEffect(() => {
        const update = () => setHighlightedLine(getHashLineNumber() ?? undefined);
        window.addEventListener('hashchange', update);
        window.addEventListener('popstate', update);
        return () => {
            window.removeEventListener('hashchange', update);
            window.removeEventListener('popstate', update);
        };
    }, []);
    useEffect(() => {
        if (!active || !editor) return undefined;
        const run = (event: KeyboardEvent) => {
            if (runDisabled || !editor.hasTextFocus()) return;
            if (
                ((event.ctrlKey || event.metaKey) &&
                    (event.key === 'Enter' || event.key.toLowerCase() === 'e')) ||
                event.key === 'F8'
            ) {
                event.preventDefault();
                event.stopPropagation();
                onRun();
            }
        };
        document.addEventListener('keydown', run, true);
        return () => document.removeEventListener('keydown', run, true);
    }, [active, editor, onRun, runDisabled]);

    const extensions = useMemo<EditorExtension[]>(
        () => [
            {
                setup: ({editor: instance, statusBarElement}) => {
                    let previous: string | undefined;
                    const enter = () => {
                        if (previous === undefined) previous = key.getScope();
                        key.setScope('monaco-editor');
                    };
                    const focus = instance.onDidFocusEditorText(enter);
                    if (instance.hasTextFocus()) enter();
                    const restore = () => {
                        if (previous !== undefined && key.getScope() === 'monaco-editor')
                            key.setScope(previous);
                        previous = undefined;
                    };
                    const blur = instance.onDidBlurEditorText(restore);
                    const vimMode =
                        vim && statusBarElement
                            ? initVimMode(instance, statusBarElement)
                            : undefined;
                    return () => {
                        focus.dispose();
                        blur.dispose();
                        restore();
                        vimMode?.dispose();
                    };
                },
            },
        ],
        [vim],
    );
    return {
        editorRef,
        preset,
        providers,
        providerContext: {engineId: draft.engine, clusterId: draft.settings?.cluster},
        extensions,
        showStatusBar: vim,
        highlightedLine,
        highlightErrorLines: true,
        diagnostics: errors.map(({message, attributes}) => ({
            message,
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: attributes.start_position.row,
            startColumn: attributes.start_position.column,
            endLineNumber: attributes.end_position.row,
            endColumn: attributes.end_position.column,
        })),
        onLineNumberClick: (line) => {
            setHighlightedLine(line);
            const url = new URL(window.location.href);
            url.hash = `L${line}`;
            window.history.pushState(null, '', url.toString());
        },
    };
}
