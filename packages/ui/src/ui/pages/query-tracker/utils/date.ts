import {durationDates} from '../../../utils/date';
import {QueryItem} from '../../../store/actions/queries/api';

export function queryDuration(query: QueryItem) {
    return durationDates(query.start_time, query.finish_time);
}
