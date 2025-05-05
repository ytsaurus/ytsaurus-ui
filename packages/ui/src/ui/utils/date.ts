import hammer from '../common/hammer';

export function durationDates(from: string, to?: string) {
    const fromDate = new Date(from).getTime();
    const toDate = (to ? new Date(to) : new Date()).getTime();
    return hammer.format.TimeDuration(toDate - fromDate);
}
