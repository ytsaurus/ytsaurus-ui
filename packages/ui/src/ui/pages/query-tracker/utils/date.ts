import hammer from '../../../common/hammer';
import {QueryItem} from '../module/api';

export function queryDuration(query: QueryItem) {
    return durationDates(query.start_time, query.finish_time);
}

export function durationDates(from: string, to?: string) {
    const fromDate = new Date(from).getTime();
    const toDate = (to ? new Date(to) : new Date()).getTime();
    return hammer.format.TimeDuration(toDate - fromDate);
}
