import {createContext} from 'react';
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const MonacoContext = createContext<Map<string, monaco.editor.IStandaloneCodeEditor>>(
    new Map(),
);
