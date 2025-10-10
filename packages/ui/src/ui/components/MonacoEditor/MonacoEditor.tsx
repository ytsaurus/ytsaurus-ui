import React, {FC, MutableRefObject, useCallback, useEffect, useRef} from 'react';
import cn from 'bem-cn-lite';
import key from 'hotkeys-js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
import {initVimMode} from 'monaco-vim/src';
import {useSelector} from '../../store/redux-hooks';
import {getTheme} from '../../store/selectors/global';
import {
    YT_DARK_HC_MONACO_THEME,
    YT_DARK_MONACO_THEME,
    YT_LIGHT_HC_MONACO_THEME,
    YT_LIGHT_MONACO_THEME,
} from './MonacoEditorThemes';
import isEqual_ from 'lodash/isEqual';
import '../../libs/monaco-yql-languages/monaco.contribution';
import './MonacoEditor.scss';
import {getSettingsEditorVimMode} from '../../store/selectors/settings/settings-ts';

const block = cn('yt-monaco-editor');

export type MonacoEditorConfig = Omit<monaco.editor.IStandaloneEditorConstructionOptions, 'theme'>;
export type Props = {
    className?: string;
    value: string;
    language?: string;
    onChange: (value: string) => void;
    onClick?: (e: monaco.editor.IEditorMouseEvent) => void;
    monacoConfig?: MonacoEditorConfig;
    editorRef?: MutableRefObject<monaco.editor.IStandaloneCodeEditor | undefined>;
    readOnly?: boolean;
};

const THEMES: Record<string, string> = {
    dark: YT_DARK_MONACO_THEME,
    'dark-hc': YT_DARK_HC_MONACO_THEME,
    light: YT_LIGHT_MONACO_THEME,
    'light-hc': YT_LIGHT_HC_MONACO_THEME,
};

const MonacoEditor: FC<Props> = ({
    className,
    readOnly,
    monacoConfig,
    value,
    language,
    onClick,
    onChange,
    editorRef,
}) => {
    const vimMode = useSelector(getSettingsEditorVimMode);
    const theme = useSelector(getTheme);
    const modelRef = useRef(monaco.editor.createModel(value, language));
    const vimModeRef = useRef<any>();

    const containerRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    const prevScopeRef = useRef<string>(key.getScope());
    const silentRef = useRef<boolean>(false);
    const prevProps = useRef<Pick<Props, 'monacoConfig' | 'readOnly'> & {theme: string}>({
        theme,
        monacoConfig,
        readOnly,
    });

    const onContentChanged = useCallback(() => {
        if (silentRef.current) return;
        onChange(modelRef.current.getValue());
    }, [onChange]);

    // first init
    useEffect(() => {
        const model = modelRef.current;
        const editorInstance = monaco.editor.create(containerRef.current!, {
            model,
            renderLineHighlight: 'none',
            colorDecorators: true,
            automaticLayout: true,
            readOnly,
            minimap: {
                enabled: false,
            },
            lineNumbers: 'on',
            suggestOnTriggerCharacters: true,
            wordBasedSuggestions: false,
            theme: THEMES[theme],
            ...monacoConfig,
        });

        editorInstance.updateOptions({
            lineNumbers: (number) => {
                return `<div class="${block('line-number')}" data-number="${number}">${number}</div>`;
            },
        });

        editorInstance.onMouseDown((e) => {
            onClick?.(e);
        });

        model.onDidChangeContent(onContentChanged);

        key.setScope('monaco-editor');
        if (editorRef) {
            editorRef.current = editorInstance;
        }

        return () => {
            editorInstance.getModel()?.dispose();
            editorInstance.dispose();
            key.setScope(prevScopeRef.current);
        };
    }, []);

    useEffect(() => {
        if (!vimMode || !editorRef?.current) return;
        vimModeRef.current = initVimMode(editorRef?.current, statusRef?.current);

        return () => {
            vimModeRef.current?.dispose();
        };
    }, [editorRef, vimMode]);

    // on props change
    useEffect(() => {
        const model = modelRef.current;
        let options: monaco.editor.IStandaloneEditorConstructionOptions = {};

        if (model.getValue() !== value) {
            silentRef.current = true;
            model.setValue(value);
            silentRef.current = false;
        }

        if (model.getLanguageId() !== language) {
            modelRef.current = monaco.editor.createModel(model.getValue(), language);
            modelRef.current.onDidChangeContent(onContentChanged);
            editorRef?.current?.setModel(modelRef.current);
        }

        if (!isEqual_(prevProps.current.monacoConfig, monacoConfig)) {
            options = {...monacoConfig};
        }

        if (theme !== prevProps.current.theme) {
            options.theme = THEMES[theme];
        }

        if (readOnly !== prevProps.current.readOnly) {
            options.readOnly = readOnly;
        }

        if (Object.keys(options).length) {
            editorRef?.current?.updateOptions(options);
        }

        prevProps.current = {
            monacoConfig,
            theme,
            readOnly,
        };
    }, [editorRef, language, monacoConfig, onContentChanged, readOnly, theme, value]);

    if (vimMode) {
        return (
            <div className={block({'vim-mode': vimMode}, className)}>
                <div ref={containerRef} className={block('editor')} />
                <div ref={statusRef} className={block('status')} />
            </div>
        );
    }

    return (
        <div className={block(null, className)}>
            <div ref={containerRef} className={block('editor')} />
        </div>
    );
};

export default MonacoEditor;
