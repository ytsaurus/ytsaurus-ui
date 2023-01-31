import {FETCH_SUGGESTIONS} from '../../../../constants/navigation/path-editor';

export const initialState = {
    suggestions: [],
    suggestionsPath: '',
    suggestionsLoaded: false,
    suggestionsLoading: false,
    suggestionsError: false,
    errorMessage: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_SUGGESTIONS.REQUEST:
            return {
                ...state,
                suggestionsLoading: true,
                suggestionsLoaded: false,
                suggestionsError: false,
            };

        case FETCH_SUGGESTIONS.SUCCESS:
            return {
                ...state,
                suggestionsLoaded: true,
                suggestionsLoading: false,
                suggestions: action.data.suggestions,
                suggestionsPath: action.data.currentParentPath,
            };

        case FETCH_SUGGESTIONS.FAILURE:
            return {
                ...state,
                suggestionsLoading: false,
                errorMessage: action.data.message,
                suggestionsError: true,
            };

        case FETCH_SUGGESTIONS.CANCELLED:
            return {
                ...state,
                suggestionsError: false,
                suggestionsLoading: false,
            };

        default:
            return state;
    }
};
