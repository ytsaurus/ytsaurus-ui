import {useContext} from 'react';
import {MonacoContext} from '../context/MonacoContext';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const useMonaco = () => {
    const editors = useContext(MonacoContext);

    const setEditor = (key: string, editor: monaco.editor.IStandaloneCodeEditor) => {
        editors.set(key, editor);
    };

    const getEditor = (key: string) => {
        return editors.get(key);
    };

    return {setEditor, getEditor};
};
