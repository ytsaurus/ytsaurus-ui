import reducer, {initialState} from './path-editor';
import * as types from '../../../../constants/navigation/path-editor';

describe('reducers/navigation/path-editor', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {type: '@@INIT'})).toEqual(initialState);
    });

    it(`should handle ${types.FETCH_SUGGESTIONS.REQUEST}`, () => {
        const action = {type: types.FETCH_SUGGESTIONS.REQUEST};
        const result = {
            ...initialState,
            suggestionsLoading: true,
            suggestionsLoaded: false,
            suggestionsError: false,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.FETCH_SUGGESTIONS.SUCCESS}`, () => {
        const suggestions = ['suggestion1', 'suggestion2'];
        const currentParentPath = '//path/to/parent/folder';
        const action = {
            type: types.FETCH_SUGGESTIONS.SUCCESS,
            data: {suggestions, currentParentPath},
        };
        const result = {
            ...initialState,
            suggestions,
            suggestionsLoaded: true,
            suggestionsLoading: false,
            suggestionsPath: currentParentPath,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.FETCH_SUGGESTIONS.FAILURE}`, () => {
        const errorMessage = 'Oops! Something went wrong';
        const action = {
            type: types.FETCH_SUGGESTIONS.FAILURE,
            data: {message: errorMessage},
        };
        const result = {
            ...initialState,
            errorMessage,
            suggestionsLoading: false,
            suggestionsError: true,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });

    it(`should handle ${types.FETCH_SUGGESTIONS.CANCELLED}`, () => {
        const action = {type: types.FETCH_SUGGESTIONS.CANCELLED};
        const result = {
            ...initialState,
            suggestionsLoading: false,
            suggestionsError: false,
            suggestionsLoaded: false,
        };

        expect(reducer(initialState, action)).toEqual(result);
    });
});
