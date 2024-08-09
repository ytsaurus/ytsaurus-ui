import {Position, editor} from 'monaco-editor';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';

export const getPathFromMonacoModel = (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
    engine: QueryEngine,
) => {
    const line = model.getLineContent(monacoCursorPosition.lineNumber);
    const editedPart = line.substring(0, monacoCursorPosition.column);

    let path = editedPart.match(/\/\/[^`]+/g);
    if (engine === QueryEngine.SPYT) {
        path = editedPart.match(/\/\/(.*)[^`]/);
    }
    return path ? path[0] : null;
};
