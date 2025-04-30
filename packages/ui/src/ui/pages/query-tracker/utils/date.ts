import {durationDates} from '../../../utils/date';
import {QueryItem} from '../module/api';

export function queryDuration(query: QueryItem) {
    return durationDates(query.start_time, query.finish_time);
}
