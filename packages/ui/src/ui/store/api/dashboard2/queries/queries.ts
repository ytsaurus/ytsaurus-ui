import {dateTimeParse} from '@gravity-ui/date-utils';
import map_ from 'lodash/map';

import format from '../../../../common/hammer/format';

import {ListQueriesParams} from '../../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {durationDates} from '../../../../utils/date';
import {QueryStatus} from '../../../../types/query-tracker';
import {QueriesListResponse} from '../../../../pages/query-tracker/module/api';

type FetchQueriesArgs = {
    requests: ListQueriesParams[];
    id: string;
};

const makeRequests = (args: ListQueriesParams[]) =>
    map_(args, (arg) => ({
        command: 'list_queries' as const,
        parameters: {...arg},
    }));

export async function fetchQuerieslist({requests}: FetchQueriesArgs) {
    try {
        const response = await ytApiV4Id.executeBatch<QueriesListResponse>(
            YTApiId.queriesDashboard,
            {
                requests: makeRequests(requests),
            },
        );

        const {results} = response;

        const queries = map_(results, (item) => {
            if (!item?.output?.queries) {
                return [];
            }
            return map_(item.output.queries, (query) => ({
                author: query?.user || 'unknown',
                general: {
                    name: query?.annotations?.title ?? 'No name',
                    state: (query?.state || format.NO_VALUE) as QueryStatus,
                    id: query?.id,
                },
                duration: durationDates(
                    String(query?.start_time || dateTimeParse('now')),
                    String(query?.finish_time || dateTimeParse('now')),
                ),
                engine: query?.engine === 'ql' ? 'yt_ql' : query?.engine || format.NO_VALUE,
                start_time: query?.start_time || format.NO_VALUE,
            }));
        });

        return {data: queries.flat()};
    } catch (error) {
        return {error};
    }
}
