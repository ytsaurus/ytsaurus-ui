import {useSelector} from 'react-redux';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import map_ from 'lodash/map';

import {RootState} from '../../../../../../store/reducers';
import {useListQueries} from '../../../../../../store/api/dashboard2/queries';
import {
    getQueryFilterEngine,
    getQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';

import {defaultDashboardItems} from '../../../../../../constants/dashboard2';

import {QueryEngine} from '../../../../../../../shared/constants/engines';
import {ListQueriesParams} from '../../../../../../../shared/yt-types';

const mapQueryStateToRequestStates: Record<string, string[]> = {
    running: ['running', 'pending'],
    completed: ['completing', 'completed'],
    failed: ['failing', 'failed'],
    aborted: ['aborting', 'aborted'],
};

export type Author = {
    value: string;
    type: 'users';
};

export function useQueriesWidget(props: PluginWidgetProps) {
    const {id: widgetId, data} = props;

    const users = map_(data?.authors as Array<Author>, ({value}) => value);
    const limit = (data?.limit as {value?: number})?.value || 0;

    const queryState = useSelector((state: RootState) => getQueryFilterState(state, widgetId));
    const engine = useSelector((state: RootState) => getQueryFilterEngine(state, widgetId));

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
            const requests: ListQueriesParams[] = [];

            users.forEach((user) => {
                requests.push(
                    ...map_(states, (state) => ({
                        engine: queryEngine,
                        state,
                        user,
                        output_format: 'json',
                        limit: limit ?? defaultDashboardItems.queries.data.limit,
                    })),
                );
            });

            return requests;
        }
        return map_(users, (user) => ({
            engine: queryEngine?.length ? queryEngine : undefined,
            user,
            output_format: 'json',
            limit: limit ?? defaultDashboardItems.queries.data.limit,
        }));
    };

    const {
        data: queries,
        error,
        isLoading,
        isFetching,
    } = useListQueries({id: widgetId, requests: makeRequests(requestedStates)});

    return {queries, error, isLoading: isLoading || isFetching};
}
