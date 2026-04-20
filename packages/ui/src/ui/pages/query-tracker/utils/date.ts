import {durationDates} from '../../../utils/date';
import {type QueryItem} from '../../../types/query-tracker/api';

export function queryDuration(query: QueryItem) {
    return durationDates(query.start_time, query.finish_time);
}
