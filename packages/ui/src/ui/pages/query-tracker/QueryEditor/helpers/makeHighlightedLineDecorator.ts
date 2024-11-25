import * as monaco from 'monaco-editor';

export const HIGHLIGHTED_LINE_CLASS = 'yt-monaco-editor__highlighted-line';
export const makeHighlightedLineDecorator = (
    model: monaco.editor.IModel,
    lineNumber: number,
): monaco.editor.IModelDeltaDecoration => ({
    range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineLength(lineNumber) + 1),
    options: {
        isWholeLine: true,
        className: HIGHLIGHTED_LINE_CLASS,
    },
});
