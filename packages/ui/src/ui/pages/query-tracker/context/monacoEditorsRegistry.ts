import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const monacoEditorsRegistry = new Map<string, monaco.editor.IStandaloneCodeEditor>();
