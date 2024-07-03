import {Range, editor} from 'monaco-editor';

export const insertTextWhereCursor = (text: string, mEditor?: editor.IStandaloneCodeEditor) => {
    if (!mEditor) return;

    const position = mEditor.getPosition();
    const range = position
        ? new Range(position.lineNumber, position.column, position.lineNumber, position.column)
        : new Range(0, 0, 0, 0);

    const edit = {range, text};
    mEditor.executeEdits('Insert text', [edit]);
};
