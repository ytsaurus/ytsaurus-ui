import {FETCH_SUGGESTIONS} from '../../../../constants/navigation/path-editor';
import {
    loadSuggestions,
    pathEditorRequests,
    preparePath,
} from '../../../../utils/navigation/path-editor';

export function loadSuggestionsList(path, customFilter) {
    return (dispatch, getState) => {
        const {suggestionsPath, suggestionsLoaded} = getState().navigation.pathEditor;
        let currentParentPath;

        try {
            currentParentPath = preparePath(path);
        } catch (error) {
            return dispatch({
                type: FETCH_SUGGESTIONS.FAILURE,
                data: {message: error.message},
            });
        }

        if (suggestionsPath === currentParentPath && suggestionsLoaded) {
            return;
        }
        dispatch({type: FETCH_SUGGESTIONS.REQUEST});

        return loadSuggestions(path, customFilter)
            .then((suggestions) => {
                dispatch({
                    type: FETCH_SUGGESTIONS.SUCCESS,
                    data: {suggestions, path, currentParentPath},
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_SUGGESTIONS.FAILURE,
                    data: {message: error.message},
                });
            });
    };
}

export function removeActiveRequests() {
    return (dispatch) => {
        pathEditorRequests.removeAllRequests();
        dispatch({type: FETCH_SUGGESTIONS.CANCELLED});
    };
}
