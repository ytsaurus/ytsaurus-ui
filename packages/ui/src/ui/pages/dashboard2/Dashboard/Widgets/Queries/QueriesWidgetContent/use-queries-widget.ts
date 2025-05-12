import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import {RootState} from '../../../../../../store/reducers';
import {useListQueries} from '../../../../../../store/api/dashboard2/queries';
import {
    getQueryFilterEngine,
    getQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';
import {getCurrentUserName} from '../../../../../../store/selectors/global';

import {QueryEngine} from '../../../../../../../shared/constants/engines';

const mapQueryStateToRequestStates: Record<string, string[]> = {
    running: ['running', 'pending'],
    completed: ['completing', 'completed'],
    failed: ['failing', 'failed'],
    aborted: ['aborting', 'aborted'],
};

export function useQueriesWidget(widgetId: string) {
    const queryState = useSelector((state: RootState) => getQueryFilterState(state, widgetId));
    const engine = useSelector((state: RootState) => getQueryFilterEngine(state, widgetId));
    const user = useSelector(getCurrentUserName);

    let queryEngine = engine?.toLowerCase();

    if (engine === 'YT_QL') {
        queryEngine = QueryEngine.YT_QL;
    }

    let requestedStates: string[] | undefined = queryState ? [queryState] : undefined;

    if (queryState && mapQueryStateToRequestStates[queryState]) {
        requestedStates = mapQueryStateToRequestStates[queryState];
    }
    const makeRequests = (states: string[] | undefined) => {
        if (states?.length) {
            return map_(states, (state) => ({
                engine: queryEngine,
                state,
                user,
                output_format: 'json',
            }));
        }
        return [
            {
                engine: queryEngine?.length ? queryEngine : undefined,
                user,
                output_format: 'json',
            },
        ];
    };

    const {
        data: queries,
        error,
        isLoading,
        isFetching,
    } = useListQueries(makeRequests(requestedStates));

    return {queries, error, isLoading, isFetching};
}
