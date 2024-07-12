import React, {MutableRefObject} from 'react';
import cn from 'bem-cn-lite';
import key from 'hotkeys-js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import {ConnectedProps, connect} from 'react-redux';

import {getTheme} from '../../store/selectors/global';
import {RootState} from '../../store/reducers';

import './MonacoEditor.scss';
import {YT_DARK_MONACO_THEME, YT_LIGHT_MONACO_THEME} from './MonacoEditorThemes';
import isEqual from 'lodash/isEqual';

import '../../libs/monaco-yql-languages/monaco.contribution';

const block = cn('yt-monaco-editor');

export type MonacoEditorConfig = Omit<monaco.editor.IStandaloneEditorConstructionOptions, 'theme'>;
export interface ExtProps {
    className?: string;
    value: string;
    language?: string;
    onChange: (value: string) => void;
    monacoConfig?: MonacoEditorConfig;
    editorRef?: MutableRefObject<monaco.editor.IStandaloneCodeEditor | undefined>;
    readOnly?: boolean;
}

type Props = ExtProps & ConnectedProps<typeof connector>;

const THEMES = {
    dark: YT_DARK_MONACO_THEME,
    'dark-hc': 'hc-black',
    light: YT_LIGHT_MONACO_THEME,
    'light-hc': YT_LIGHT_MONACO_THEME,
};

class MonacoEditor extends React.Component<Props> {
    ref = React.createRef<HTMLDivElement>();
    model = monaco.editor.createModel('', this.props.language);
    editor?: monaco.editor.IStandaloneCodeEditor;
    prevScope?: string;
    silent = false;

    componentDidMount() {
        const {theme, monacoConfig, editorRef, readOnly} = this.props;
        this.model.setValue(this.props.value);
        this.editor = monaco.editor.create(this.ref.current!, {
            model: this.model,
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

        this.model.onDidChangeContent(this.onContentChanged);
        this.prevScope = key.getScope();
        key.setScope('monaco-editor');
        if (editorRef) {
            editorRef.current = this.editor;
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {theme, value, monacoConfig, readOnly, language} = this.props;
        const options: monaco.editor.IStandaloneEditorConstructionOptions = {};
        if (prevProps.theme !== theme) {
            options.theme = THEMES[theme];
        }
        if (!isEqual(prevProps.monacoConfig, monacoConfig)) {
            Object.assign(options, monacoConfig);
        }
        if (value !== this.model.getValue()) {
            this.silent = true;
            this.model.setValue(value);
            this.silent = false;
        }
        if (language !== prevProps.language) {
            this.model = monaco.editor.createModel(this.model.getValue(), this.props.language);
            this.model.onDidChangeContent(this.onContentChanged); // the new model needs to re-specify the callback
            this.editor?.setModel(this.model);
        }
        if (readOnly !== prevProps.readOnly) {
            this.editor?.updateOptions({readOnly});
        }

        this.editor?.updateOptions(options);
    }

    componentWillUnmount() {
        this.editor?.getModel()?.dispose();
        this.editor?.dispose();
        key.setScope(this.prevScope!);
    }

    render() {
        const {className} = this.props;

        return (
            <div className={block(null, className)}>
                <div ref={this.ref} className={block('editor')} />
            </div>
        );
    }

    onContentChanged = () => {
        if (this.silent) {
            return;
        }
        const {onChange} = this.props;
        const value = this.model.getValue();
        onChange(value);
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        theme: getTheme(state) as 'dark' | 'dark-hc' | 'light' | 'light-hc',
    };
};

const connector = connect(mapStateToProps);
export default connector(MonacoEditor);
