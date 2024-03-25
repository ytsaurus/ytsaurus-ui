import {IRange, Position, editor} from 'monaco-editor';

export const getRangeToInsertSuggestion = (
    model: editor.ITextModel,
    cursorPosition: Position,
): IRange => {
    const {startColumn: lastWordStartColumn, endColumn: lastWordEndColumn} =
        model.getWordUntilPosition(cursorPosition);
    // https://github.com/microsoft/monaco-editor/discussions/3639#discussioncomment-5190373 if user already typed "$" sign, it should not be duplicated
    const dollarBeforeLastWordStart =
        model.getLineContent(cursorPosition.lineNumber)[lastWordStartColumn - 2] === '$' ? 1 : 0;
    return {
        startColumn: lastWordStartColumn - dollarBeforeLastWordStart,
        startLineNumber: cursorPosition.lineNumber,
        endColumn: lastWordEndColumn,
        endLineNumber: cursorPosition.lineNumber,
    };
};
