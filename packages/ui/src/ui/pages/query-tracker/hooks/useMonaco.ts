import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import {monacoEditorsRegistry} from '../context/monacoEditorsRegistry';

export const useMonaco = () => {
    const setEditor = (key: string, editor: monaco.editor.IStandaloneCodeEditor) => {
        monacoEditorsRegistry.set(key, editor);
    };

    const getEditor = (key: string) => {
        return monacoEditorsRegistry.get(key);
    };

    return {setEditor, getEditor};
};
