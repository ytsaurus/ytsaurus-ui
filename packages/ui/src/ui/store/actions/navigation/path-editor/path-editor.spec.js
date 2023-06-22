import mockStore from '../../../../store/__mocks__';

import {
    loadSuggestions,
    pathEditorRequests,
    preparePath,
} from '../../../../utils/navigation/path-editor';
import {
    loadSuggestionsList,
    removeActiveRequests,
} from '../../../../store/actions/navigation/path-editor/path-editor';
import * as types from '../../../../constants/navigation/path-editor';

jest.mock('../../../../utils/navigation/path-editor', () => ({
    loadSuggestions: jest
        .fn()
        .mockImplementation(() => Promise.resolve(['suggestion1', 'suggestion2'])),
    preparePath: jest.fn().mockImplementation((path) => path),
    pathEditorRequests: {
        removeAllRequests: jest.fn(),
    },
}));

const path = '//path/to/object/';
const currentParentPath = preparePath(path);

const Action = {
    REQUEST: {type: types.FETCH_SUGGESTIONS.REQUEST},
    SUCCESS: {
        type: types.FETCH_SUGGESTIONS.SUCCESS,
        data: {
            suggestions: ['suggestion1', 'suggestion2'],
            currentParentPath,
            path,
        },
    },
    FAILURE: {
        type: types.FETCH_SUGGESTIONS.FAILURE,
        data: {
            message: 'Oops! Something went wrong',
        },
    },
    CANCELLED: {type: types.FETCH_SUGGESTIONS.CANCELLED},
};

describe('actions/navigation/path-editor', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            navigation: {
                pathEditor: {
                    suggestionsPath: '',
                    suggestionsLoaded: false,
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loadSuggestionsList', () => {
        it('should return function from action creator', () => {
            expect(loadSuggestionsList()).toBeFunction();
        });

        it("should avoid dispatching a request and calling loadSuggestions() if data hasn't changed", () => {
            store = mockStore({
                navigation: {
                    pathEditor: {
                        suggestionsPath: path,
                        suggestionsLoaded: true,
                    },
                },
            });
            store.dispatch(loadSuggestionsList(path));

            expect(loadSuggestions).not.toHaveBeenCalled();
            expect(store.getActions()).toBeArrayOfSize(0);
        });

        it(`should dispatch ${types.FETCH_SUGGESTIONS.REQUEST}`, () => {
            store.dispatch(loadSuggestionsList());

            const actions = store.getActions();

            expect(actions).toContainEqual(Action.REQUEST);
        });

        it('should call loadSuggestions()', () => {
            const customFilter = jest.fn();

            store.dispatch(loadSuggestionsList(path, customFilter));

            expect(loadSuggestions).toHaveBeenCalled();
            expect(loadSuggestions).toHaveBeenCalledWith(path, customFilter);
        });

        it('should call preparePath()', () => {
            store.dispatch(loadSuggestionsList(path));

            expect(preparePath).toHaveBeenCalled();
        });

        it(`should dispatch ${types.FETCH_SUGGESTIONS.SUCCESS}`, async () => {
            await store.dispatch(loadSuggestionsList(path));

            expect(store.getActions()).toContainEqual(Action.SUCCESS);
        });

        it(`should dispatch ${types.FETCH_SUGGESTIONS.FAILURE} and loadSuggestions not to have been called `, async () => {
            preparePath.mockImplementation(() => {
                throw new Error('Oops! Something went wrong');
            });
            await store.dispatch(loadSuggestionsList(path));

            expect(store.getActions()).toContainEqual(Action.FAILURE);
            expect(loadSuggestions).not.toHaveBeenCalled();
        });

        it(`should dispatch ${types.FETCH_SUGGESTIONS.FAILURE}`, async () => {
            loadSuggestions.mockImplementation(() =>
                Promise.reject(new Error('Oops! Something went wrong')),
            );
            await store.dispatch(loadSuggestionsList(path));

            expect(store.getActions()).toContainEqual(Action.FAILURE);
        });
    });

    describe('removeActiveRequests', () => {
        beforeEach(() => {
            store.dispatch(removeActiveRequests());
        });

        it('should return function from action creator', () => {
            expect(removeActiveRequests()).toBeFunction();
        });

        it('should abort all active requests', () => {
            expect(pathEditorRequests.removeAllRequests).toHaveBeenCalled();
        });

        it(`should dispatch ${types.FETCH_SUGGESTIONS.CANCELLED}`, () => {
            const actions = store.getActions();

            expect(actions).toContainEqual(Action.CANCELLED);
        });
    });
});
