import {type QueryHistoryRow, type QueryListItem} from '@gravity-ui/querieskit';
import moment from 'moment';

import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueryStatus} from '../../../../types/query-tracker';
import {QueriesListMode} from '../../../../types/query-tracker/queryList';
import {makeQueryUrl} from '../../../../utils/app-url/makeQueryUrl';
import {QueryEngine, QueryEnginesNames} from '../../../../../shared/constants/engines';

export type HistoryItem = QueryHistoryRow;

const statuses: Record<QueryStatus, QueryHistoryRow['status']> = {
    [QueryStatus.DRAFT]: 'draft',
    [QueryStatus.PENDING]: 'running',
    [QueryStatus.RUNNING]: 'running',
    [QueryStatus.COMPLETING]: 'running',
    [QueryStatus.FAILING]: 'running',
    [QueryStatus.ABORTING]: 'running',
    [QueryStatus.COMPLETED]: 'completed',
    [QueryStatus.FAILED]: 'failed',
    [QueryStatus.ABORTED]: 'aborted',
};

function getPreviewLineNumber(query: string | undefined, search: string | undefined) {
    if (!query || !search) {
        return undefined;
    }

    const text = query.toLowerCase();
    const matchIndex = text.indexOf(search);
    if (matchIndex === -1) {
        return undefined;
    }

    return text.slice(0, matchIndex).split(/\r\n|\r|\n/).length;
}

export function prepareHistoryItems({
    queries,
    cluster,
    fullTextSearch,
    filter,
    noNameTitle,
    sharedQueryAco,
}: {
    queries: QueryItem[];
    cluster: string;
    fullTextSearch: boolean;
    filter?: string;
    noNameTitle: string;
    sharedQueryAco: string;
}): QueryListItem<HistoryItem>[] {
    const search = fullTextSearch ? filter?.trim().toLowerCase() : undefined;
    const items: QueryListItem<HistoryItem>[] = [];
    let previousDate: string | undefined;
    for (const queryItem of queries) {
        const date = moment(queryItem.start_time).format('DD MMMM YYYY');
        if (!fullTextSearch && date !== previousDate) {
            items.push({header: date, height: 28});
            previousDate = date;
        }
        items.push({
            id: queryItem.id,
            title: queryItem.annotations?.title || noNameTitle,
            height: 52,
            engine:
                queryItem.engine === QueryEngine.YT_QL
                    ? 'YTQL'
                    : QueryEnginesNames[queryItem.engine],
            mode: queryItem.settings?.execution_mode,
            isPrivate: !queryItem.access_control_objects?.includes(sharedQueryAco),
            startTime: queryItem.start_time,
            endTime: queryItem.finish_time || undefined,
            query: queryItem.query,
            previewLineNumber: getPreviewLineNumber(queryItem.query, search),
            status: statuses[queryItem.state],
            href: makeQueryUrl({cluster, queryId: queryItem.id, listMode: QueriesListMode.History}),
        });
    }
    return items;
}
