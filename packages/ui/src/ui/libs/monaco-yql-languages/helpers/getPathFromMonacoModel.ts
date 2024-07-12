import {Position, editor} from 'monaco-editor';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import {getWindowStore} from '../../../store/window-store';

export const getPathFromMonacoModel = (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
    engine: QueryEngine,
) => {
    const line = model.getLineContent(monacoCursorPosition.lineNumber);
    const editedPart = line.substring(0, monacoCursorPosition.column);

    const clusterMatch = editedPart.match(/\w+\./);
    const clusterName = clusterMatch ? clusterMatch[0].replace(/\./, '') : null;

    const useArray = model.getValue().match(/(USE|use)\s\w+/g);
    const useClusterName = useArray ? useArray.pop()?.replace(/(USE|use)\s/, '') : null;

    let path: RegExpMatchArray | null = null;
    if (engine === QueryEngine.SPYT) {
        path = editedPart.match(/\/\/(.*)[^`]/);
    } else {
        path = editedPart.match(/\/\/[^`]+/g);
    }

    let cluster = clusterName || useClusterName;

    if (!cluster) {
        // get cluster from select
        const state = getWindowStore().getState();
        cluster = state.queryTracker.query?.draft.settings?.cluster;
    }

    return {
        path: path ? path[0] : null,
        cluster,
    };
};
