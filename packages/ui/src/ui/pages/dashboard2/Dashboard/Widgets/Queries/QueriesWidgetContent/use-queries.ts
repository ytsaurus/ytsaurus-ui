import {useSelector} from 'react-redux';

import map_ from 'lodash/map';

import {useListQueriesQuery} from '../../../../../../store/api/yt';
import {
    selectQueriesEngine,
    selectQueriesState,
} from '../../../../../../store/reducers/dashboard2/queries';
import {getCurrentUserName} from '../../../../../../store/selectors/global';

import {durationDates} from '../../../../../../utils/date';

export function useQueries() {
    const state = useSelector(selectQueriesState);
    const engine = useSelector(selectQueriesEngine);
    const user = useSelector(getCurrentUserName);

    const {data, isLoading} = useListQueriesQuery({
        parameters: {
            output_format: 'json',
            user,
            state,
            engine,
        },
    });

    const queries = map_(data?.queries || [], (query) => ({
        author: query.user,
        general: {
            name: query?.annotations?.title ?? 'No name',
            state: query.state,
            id: query.id,
        },
        duration: durationDates(query.start_time, query.finish_time),
        engine: query.engine,
        start_time: query.start_time,
    }));

    return {queries, isLoading};
}
