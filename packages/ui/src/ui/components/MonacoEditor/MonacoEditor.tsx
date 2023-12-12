import React, {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import key from 'hotkeys-js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import {useSelector} from 'react-redux';

import {getTheme} from '../../store/selectors/global';

import './MonacoEditor.scss';
import {YT_DARK_MONACO_THEME, YT_LIGHT_MONACO_THEME} from './MonacoEditorThemes';
import isEqual from 'lodash/isEqual';

import '../../libs/monaco-yql-languages/monaco.contribution';
import {useEffectOnce, useUnmount, useUpdateEffect} from 'react-use';

const block = cn('yt-monaco-editor');

export type MonacoEditorConfig = Omit<monaco.editor.IStandaloneEditorConstructionOptions, 'theme'>;
interface BaseProps {
    className?: string;
    monacoConfig?: MonacoEditorConfig;
    editorRef?: MutableRefObject<monaco.editor.IStandaloneCodeEditor | undefined>;
}
interface InnerProps extends BaseProps {
    model: monaco.editor.ITextModel | undefined;
}
export interface MonacoEditorProps extends BaseProps {
    value: string;
    language?: string;
    onChange?: (newVal: string) => void;
}

const THEMES = {
    dark: YT_DARK_MONACO_THEME,
    'dark-hc': 'hc-black',
    light: YT_LIGHT_MONACO_THEME,
    'light-hc': YT_LIGHT_MONACO_THEME,
};

type Theme = keyof typeof THEMES;

type EditorModelProps = {value?: string; language?: string; onChange?: (newVal: string) => void};
const useEditorModel = ({value = '', language = 'text', onChange}: EditorModelProps) => {
    const [model, setModel] = useState<monaco.editor.ITextModel>();
    if (!model || model.isDisposed()) {
        setModel(monaco.editor.createModel(value, language));
    }
    const [listener, setListener] = useState<monaco.IDisposable>();

    useUnmount(() => model?.dispose());

    useUpdateEffect(() => {
        if (model && value !== model?.getValue()) {
            model.setValue(value);
        }
    }, [value]);

    useUpdateEffect(() => {
        if (model) {
            monaco.editor.setModelLanguage(model, language);
        }
    }, [model, language]);

    useUpdateEffect(() => {
        if (!model || !onChange) {
            return;
        }

        listener?.dispose();

        setListener(model.onDidChangeContent(() => onChange(model.getValue())));
        return () => {
            listener?.dispose();
        };
    }, [model, onChange]);

    return model as monaco.editor.ITextModel;
};

const InnerEditor = React.memo(function InnerEditor(props: InnerProps) {
    const {monacoConfig, editorRef, model, className} = props;
    const theme = useSelector(getTheme) as Theme;

    const prevProps = useRef<InnerProps & {theme: Theme}>();
    const savePrevProps = useCallback(() => {
        prevProps.current = {...props, theme};
    }, [prevProps, props, theme]);

    const ref = useRef<HTMLDivElement>(null);
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const [prevScope, setPrevScope] = useState<string>();

    useEffectOnce(() => {
        editor.current = monaco.editor.create(ref.current!, {
            model,
            renderLineHighlight: 'none',
            colorDecorators: true,
            automaticLayout: true,
            minimap: {
                enabled: false,
            },
            lineNumbers: 'on',
            suggestOnTriggerCharacters: false,
            wordBasedSuggestions: false,
            theme: THEMES[theme],
            ...monacoConfig,
        });

        setPrevScope(key.getScope());
        key.setScope('monaco-editor');
        if (editorRef) {
            editorRef.current = editor.current;
        }
        savePrevProps();
        return () => {
            editor.current?.getModel()?.dispose();
            editor.current?.dispose();
            key.setScope(prevScope!);
        };
    });

    useUpdateEffect(() => {
        const options: monaco.editor.IStandaloneEditorConstructionOptions = {};
        if (prevProps.current!.theme !== theme) {
            options.theme = THEMES[theme];
        }
        if (!isEqual(prevProps.current!.monacoConfig, monacoConfig)) {
            Object.assign(options, monacoConfig);
        }

        editor.current?.updateOptions(options);
        savePrevProps();
    }, [theme, monacoConfig]);

    useEffect(() => {
        if (model && editor.current && !model.isDisposed()) {
            editor.current.setModel(model);
        }
    }, [model]);

    return (
        <div className={block(null, className)}>
            <div ref={ref} className={block('editor')} />
        </div>
    );
});

export default function MonacoEditor({
    value,
    className,
    editorRef,
    language,
    monacoConfig,
    onChange,
}: MonacoEditorProps) {
    const model = useEditorModel({value, language, onChange});
    return (
        <InnerEditor
            model={model}
            className={className}
            editorRef={editorRef}
            monacoConfig={monacoConfig}
        />
    );
}
