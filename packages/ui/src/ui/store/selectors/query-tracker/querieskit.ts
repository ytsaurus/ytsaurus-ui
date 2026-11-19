import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {selectCluster} from '../global';
import {selectQueriesListMode, selectTutorialQueriesList} from './queriesList';
import {makeQueryUrl} from '../../../utils/app-url';

const TUTORIAL_ROW_HEIGHT = 32;

export const selectQueriesKitTutorialItems = createSelector(
    [
        selectTutorialQueriesList,
        selectCluster,
        selectQueriesListMode,
        (_state: RootState, search: string) => search,
        (_state: RootState, _search: string, noNameTitle: string) => noNameTitle,
    ],
    (queries, cluster, listMode, search, noNameTitle) => {
        const normalizedSearch = search.toLocaleLowerCase();

        // Assign numbers before filtering so searching does not renumber lessons.
        return queries
            .map((query, index) => ({
                id: query.id,
                title: query.annotations?.title || noNameTitle,
                number: index + 1,
                height: TUTORIAL_ROW_HEIGHT,
                href: makeQueryUrl({cluster, queryId: query.id, listMode}),
            }))
            .filter((_, index) => {
                if (!search) {
                    return true;
                }
                return Boolean(
                    queries[index].annotations?.title
                        ?.toLocaleLowerCase()
                        .includes(normalizedSearch),
                );
            });
    },
);
