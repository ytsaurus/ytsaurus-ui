import {useSelector} from 'react-redux';

import map_ from 'lodash/map';
import isEmpty_ from 'lodash/isEmpty';

import {RootState} from '../../../../../../store/reducers';
import {useListQueries} from '../../../../../../store/api/dashboard2/queries';
import {
    getSettingQueryFilterEngine,
    getSettingQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';
import {getCurrentUserName} from '../../../../../../store/selectors/global';

export function useQueriesWidget(widgetId: string) {
    const queryState = useSelector((state: RootState) =>
        getSettingQueryFilterState(state, widgetId),
    );
    const engine = useSelector((state: RootState) => getSettingQueryFilterEngine(state, widgetId));
    const user = useSelector(getCurrentUserName);

    const queryEngine =
        engine === 'YT_QL' ? 'ql' : isEmpty_(engine) ? undefined : engine?.toLowerCase();

    let requestedStates: string[] | undefined = [];

    if (queryState === 'running') {
        requestedStates = ['running', 'pending'];
    } else if (queryState === 'completed') {
        requestedStates = ['completing', 'completed'];
    } else if (queryState === 'failed') {
        requestedStates = ['failing', 'failed'];
    } else if (queryState === 'aborted') {
        requestedStates = ['aborting', 'aborted'];
    } else {
        requestedStates = queryState ? [queryState] : undefined;
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
                engine: queryEngine,
                user,
                output_format: 'json',
                limit: 10,
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
