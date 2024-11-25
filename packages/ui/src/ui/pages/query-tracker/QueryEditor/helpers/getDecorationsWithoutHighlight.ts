import * as monaco from 'monaco-editor';
import {HIGHLIGHTED_LINE_CLASS} from './makeHighlightedLineDecorator';

export const getDecorationsWithoutHighlight = (
    model?: monaco.editor.IModel | null,
    editor?: monaco.editor.IStandaloneCodeEditor,
) => {
    const range = model?.getFullModelRange();
    if (!range) return [];

    const allDecorations = editor?.getDecorationsInRange(range) || [];
    return allDecorations.filter((d) => d.options.className !== HIGHLIGHTED_LINE_CLASS);
};
