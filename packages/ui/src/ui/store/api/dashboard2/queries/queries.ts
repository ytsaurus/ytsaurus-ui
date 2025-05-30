import map_ from 'lodash/map';

import {ListQueriesParams} from '../../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {durationDates} from '../../../../utils/date';
import {QueryStatus} from '../../../../types/query-tracker';

const makeRequests = (args: ListQueriesParams[]) =>
    map_(args, (arg) => ({
        command: 'list_queries' as const,
        parameters: {...arg},
    }));

export async function list(args: ListQueriesParams[]) {
    try {
        const response = await ytApiV4Id.executeBatch(YTApiId.listQueries, {
            requests: makeRequests(args),
        });

        const {results} = response;

        const queries = map_(results, (item) => {
            if (!item?.output?.queries) {
                return [];
            }
            return map_(item.output.queries, (query) => ({
                author: query?.user || 'unknown',
                general: {
                    name: query?.annotations?.title ?? 'No name',
                    state: (query?.state || '') as QueryStatus,
                    id: query?.id,
                },
                duration: durationDates(query?.start_time || 0, query?.finish_time || 0),
                engine: query?.engine === 'ql' ? 'yt_ql' : query?.engine || '-',
                start_time: query?.start_time || '-',
            }));
        });

        return {data: queries.flat()};
    } catch (error) {
        return {error};
    }
}
