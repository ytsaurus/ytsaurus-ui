import moment from 'moment';
import {type QueriesHistoryProps, type QueryHistoryRow} from '@gravity-ui/querieskit';

import {QueryEnginesNames} from '../../../../../shared/constants/engines';
import {SHARED_QUERY_ACO} from '../../../../store/selectors/query-tracker/query';
import {type QueryItem} from '../../../../types/query-tracker/api';
import {QueriesListMode} from '../../../../types/query-tracker/queryList';
import {ProgressStatuses, QueryStatus} from '../../../../types/query-tracker';
import {makeQueryUrl} from '../../../../utils/app-url';
import {prepareFullTextSearchItems} from '../helpers/prepareFullTextSearchItems';
import i18n from '../i18n';
import {type HistoryRow} from './types';

const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 28;
const SEARCH_PREVIEW_LINES = 4;

function getHistoryStatus(status: QueryStatus): QueryHistoryRow['status'] {
    if (ProgressStatuses.includes(status)) {
        return 'running';
    }

    switch (status) {
        case QueryStatus.COMPLETED:
            return 'completed';
        case QueryStatus.FAILED:
            return 'failed';
        case QueryStatus.ABORTED:
            return 'aborted';
        case QueryStatus.DRAFT:
            return 'draft';
        default:
            return 'running';
    }
}

export function prepareHistoryItems({
    queries,
    cluster,
    searchMode,
    filter,
}: {
    queries: QueryItem[];
    cluster: string;
    searchMode: 'name' | 'text';
    filter?: string;
}): QueriesHistoryProps<HistoryRow>['items'] {
    const preparedQueries =
        searchMode === 'text'
            ? prepareFullTextSearchItems({
                  items: queries,
                  filter,
                  maxLines: SEARCH_PREVIEW_LINES,
              })
            : queries;

    const result: QueriesHistoryProps<HistoryRow>['items'] = [];
    let currentDate: string | undefined;

    preparedQueries.forEach((query) => {
        const date = moment(query.start_time).format('DD MMMM YYYY');
        if (date !== currentDate) {
            currentDate = date;
            result.push({header: date, height: HEADER_HEIGHT});
        }

        result.push({
            id: query.id,
            title: query.annotations?.title || i18n('field_no-name'),
            status: getHistoryStatus(query.state),
            engine: QueryEnginesNames[query.engine] ?? query.engine,
            mode: query.settings?.execution_mode,
            startTime: query.start_time,
            endTime: query.finish_time || undefined,
            query: query.query,
            isPrivate: !query.access_control_objects?.includes(SHARED_QUERY_ACO),
            href: makeQueryUrl({cluster, queryId: query.id, listMode: QueriesListMode.History}),
            height: ROW_HEIGHT,
            queryItem: query,
        });
    });

    return result;
}
