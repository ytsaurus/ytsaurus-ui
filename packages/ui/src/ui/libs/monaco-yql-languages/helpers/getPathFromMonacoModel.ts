import {Position, editor} from 'monaco-editor';
import {QueryEngine} from '../../../../shared/constants/engines';
import {getClustersAndPaths} from './getClusterAndPath';

export const getPathFromMonacoModel = (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
    engine: QueryEngine,
) => {
    const line = model.getLineContent(monacoCursorPosition.lineNumber);
    const editedPart = line.substring(0, monacoCursorPosition.column);

    const paths = getClustersAndPaths(editedPart, engine);
    const currentPath = paths.find(({position}) => {
        return (
            position &&
            position.start <= monacoCursorPosition.column &&
            position.end >= monacoCursorPosition.column
        );
    });

    if (!currentPath) return null;

    const useArray = model.getValue().match(/(USE|use)\s\w+/g);
    const useClusterName = useArray ? useArray.pop()?.replace(/(USE|use)\s/, '') : null;

    return {
        path: currentPath.path,
        cluster: currentPath.cluster || useClusterName,
    };
};
