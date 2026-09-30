import type * as monaco from 'monaco-editor/editor/editor.api';

export const monacoEditorsRegistry = new Map<string, monaco.editor.IStandaloneCodeEditor>();
