import {Position, editor} from 'monaco-editor';
import {QueryEngine} from '../../../../shared/constants/engines';
import {getClusterAndPath} from './getClusterAndPath';

export const getPathFromMonacoModel = (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
    engine: QueryEngine,
) => {
    const line = model.getLineContent(monacoCursorPosition.lineNumber);
    const editedPart = line.substring(0, monacoCursorPosition.column);

    const {path, cluster} = getClusterAndPath(editedPart, engine);
    const useArray = model.getValue().match(/(USE|use)\s\w+/g);
    const useClusterName = useArray ? useArray.pop()?.replace(/(USE|use)\s/, '') : null;

    return {
        path,
        cluster: cluster || useClusterName,
    };
};
