import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as monaco from 'monaco-editor';
import key from 'hotkeys-js';
// @ts-ignore The package does not ship declarations for this entrypoint.
import {initVimMode} from 'monaco-vim/src';
import type {EditorExtension, MonacoEditorIntegrationProps} from '@gravity-ui/querieskit';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectQueryDraft,
    selectQueryEditorErrors,
} from '../../../store/selectors/query-tracker/query';
import {selectSettingsEditorVimMode} from '../../../store/selectors/settings/settings-ts';
import {openPath} from '../../../store/actions/query-tracker/queryNavigation';
import {monacoEditorsRegistry} from '../context/monacoEditorsRegistry';
import {LinkDecorator} from '../QueryEditor/decorators/LinkDecorator';
import {getHashLineNumber} from '../QueryEditor/helpers/getHashLineNumber';
import {checkControlCommandKey, getControlCommandKey} from '../../../utils/keyboard';
import {useMonacoQuerySuggestions} from '../querySuggestionsModule/useMonacoQuerySuggestions';
// Reuse the application providers. Do not also install a querieskit completion preset.
import '../../../libs/monaco-yql-languages/monaco.contribution';

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
    const link = useRef<LinkDecorator>();
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
        if (!editor) return undefined;
        const decorator = new LinkDecorator(editor, draft.engine, getControlCommandKey());
        link.current = decorator;
        decorator.updateLinks();
        return () => {
            decorator.dispose();
            link.current = undefined;
        };
    }, [editor, draft.engine]);
    useEffect(() => {
        link.current?.updateLinks();
    }, [draft.query, draft.settings?.cluster]);
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
        onClick: ({target, event}) => {
            if (
                target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT ||
                !target.position ||
                !checkControlCommandKey(event)
            )
                return;
            const path = link.current?.findLink(target.position);
            if (path) dispatch(openPath(path.path, path.cluster));
        },
    };
}
