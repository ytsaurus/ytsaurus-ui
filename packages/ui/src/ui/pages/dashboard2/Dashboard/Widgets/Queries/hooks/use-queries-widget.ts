import {useMemo} from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';

import map_ from 'lodash/map';

import {RootState} from '../../../../../../store/reducers';
import {useListQueries} from '../../../../../../store/api/dashboard2/queries';
import {
    getQueryFilterEngine,
    getQueryFilterState,
} from '../../../../../../store/selectors/dashboard2/queries';
import {getCluster} from '../../../../../../store/selectors/global';

import {defaultDashboardItems} from '../../../../../../constants/dashboard2';

import {QueryEngine} from '../../../../../../../shared/constants/engines';
import {ListQueriesParams} from '../../../../../../../shared/yt-types';
import {QueriesWidgetProps} from '../types';

const mapQueryStateToRequestStates: Record<string, string[]> = {
    running: ['running', 'pending'],
    completed: ['completing', 'completed'],
    failed: ['failing', 'failed'],
    aborted: ['aborting', 'aborted'],
};

export function useQueriesWidget(props: QueriesWidgetProps) {
    const {id: widgetId, data} = props;

    const users = map_(data?.authors, ({value}) => value);
    const limit = data?.limit?.value || 0;

    const cluster = useSelector(getCluster);
    const queryState = useSelector((state: RootState) => getQueryFilterState(state, widgetId));
    const engine = useSelector((state: RootState) => getQueryFilterEngine(state, widgetId));

    let queryEngine = engine?.toLowerCase();

    if (engine === 'YT_QL') {
        queryEngine = QueryEngine.YT_QL;
    }

    const requestedStates: string[] | undefined = useMemo(() => {
        if (!queryState) {
            return undefined;
        }

        if (mapQueryStateToRequestStates[queryState]) {
            return mapQueryStateToRequestStates[queryState];
        }

        return [queryState];
    }, [queryState]);

    // TODO: move requests comptations to api
    const requests = useMemo(() => {
        if (requestedStates?.length) {
            const requests: ListQueriesParams[] = [];

            users.forEach((user) => {
                requests.push(
                    ...map_(requestedStates, (state) => ({
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
    }, [limit, queryEngine, requestedStates, users]);

    const {
        data: queriesResponse,
        error,
        isLoading,
        isFetching,
    } = useListQueries({id: widgetId, requests, cluster}, {refetchOnMountOrArgChange: true});

    return {
        queries: queriesResponse?.queries,
        error,
        isLoading: isLoading || isFetching,
        requestedQueriesErrors: queriesResponse?.requestedQueriesErrors,
    };
}
