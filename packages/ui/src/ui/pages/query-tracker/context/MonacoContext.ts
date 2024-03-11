import {createContext} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const MonacoContext = createContext<Map<string, monaco.editor.IStandaloneCodeEditor>>(
    new Map(),
);
