import {type QueryHistoryRow} from '@gravity-ui/querieskit';

import {type QueryItem} from '../../../../types/query-tracker/api';

export type HistoryRow = QueryHistoryRow & {queryItem: QueryItem};
