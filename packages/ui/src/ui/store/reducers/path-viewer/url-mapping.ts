import {initialState} from '../../../store/reducers/path-viewer';
import {RootState} from '../../../store/reducers';
import produce from 'immer';
import {updateIfChanged} from '../../../utils/utils';

export const pathViewerParams = {
    path: {
        stateKey: 'pathViewer.path',
        initialState: initialState.path,
    },
    attributes: {
        stateKey: 'pathViewer.attributes',
        initialState: initialState.attributes,
    },
    command: {
        stateKey: 'pathViewer.command',
        initialState: initialState.command,
    },
    maxSize: {
        stateKey: 'pathViewer.maxSize',
        initialState: initialState.maxSize,
    },
    encodeUTF8: {
        stateKey: 'pathViewer.encodeUTF8',
        initialState: initialState.encodeUTF8,
        type: 'bool',
    },
    stringify: {
        stateKey: 'pathViewer.stringify',
        initialState: initialState.stringify,
        type: 'bool',
    },
    annotateWithTypes: {
        stateKey: 'pathViewer.annotateWithTypes',
        initialState: initialState.annotateWithTypes,
        type: 'bool',
    },
};

export function getPathViewerPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.pathViewer, 'path', query.pathViewer.path);
        updateIfChanged(draft.pathViewer, 'attributes', query.pathViewer.attributes);
        updateIfChanged(draft.pathViewer, 'command', query.pathViewer.command);
        updateIfChanged(draft.pathViewer, 'maxSize', query.pathViewer.maxSize);
        updateIfChanged(draft.pathViewer, 'encodeUTF8', query.pathViewer.encodeUTF8);
        updateIfChanged(draft.pathViewer, 'stringify', query.pathViewer.stringify);
        updateIfChanged(draft.pathViewer, 'annotateWithTypes', query.pathViewer.annotateWithTypes);
    });
}
