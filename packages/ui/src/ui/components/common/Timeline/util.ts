/* eslint-disable valid-jsdoc */
import moment, {MomentInput, unitOfTime} from 'moment';

/** @deprecated */
export const getNow = () => Number(new Date());

export const minute = 60 * 1000;
export const hour = minute * 60;
export const day = hour * 24;
export const week = day * 7;
export const month = day * 30;
export const year = day * 365;

/**
 * Creates a human-readable representation of time interval
 * @param from Interval start, ms from epoch
 * @param to Interval end, ms from epoch
 * @returns Formatted string, e.g. 1d 3h
 */
export const humanizeInterval = (from: number, to: number) => {
    const duration = to - from;
    if (duration >= year) {
        const years = Math.floor(duration / year);
        const months = Math.floor((duration % year) / month);
        return months === 0 || years > 4 ? `${years}y` : `${years}y ${months}mo`;
    }
    if (duration >= month) {
        const months = Math.floor(duration / month);
        const days = Math.floor((duration % month) / day);
        return days === 0 || months > 4 ? `${months}mo` : `${months}mo ${days}d`;
    }
    if (duration >= week) {
        const weeks = Math.floor(duration / week);
        const days = Math.floor((duration % week) / day);
        return days === 0 || weeks > 3 ? `${weeks}w` : `${weeks}w ${days}d`;
    }
    if (duration >= day) {
        const days = Math.floor(duration / day);
        const hours = Math.floor((duration % day) / hour);
        return hours === 0 || days > 4 ? `${days}d` : `${days}d ${hours}h`;
    }
    if (duration >= hour) {
        const hours = Math.floor(duration / hour);
        const minutes = Math.floor((duration % hour) / minute);
        return minutes === 0 || hours > 6 ? `${hours}h` : `${hours}h ${minutes}m`;
    }
    const minutes = Math.round(duration / minute);
    return `${minutes}m`;
};

export const formatInterval = (from: MomentInput, to: MomentInput) => {
    const mFrom = moment(from);
    const mTo = moment(to);
    if (mTo.isSame(mFrom, 'd')) {
        /* eslint-disable no-irregular-whitespace */
        return `${mFrom.format('YYYY-MM-DD  HH:mm')}  —  ${mTo.format('HH:mm')}`;
    } else {
        return `${mFrom.format('YYYY-MM-DD  HH:mm')}  —  ${mTo.format('YYYY-MM-DD  HH:mm')}`;
        /* eslint-enable no-irregular-whitespace */
    }
};

export const formatTime = (date: MomentInput) => {
    return moment(date).format('HH:mm');
};

export const formatDateCompact = (date: MomentInput) => {
    return moment(date).format('DD.MM.YY, HH:mm');
};

export const formatTimeCanonical = (ts: MomentInput) => {
    return moment(ts).format('YYYY-MM-DD HH:mm');
};

export const formatTimeISO = (ts: MomentInput) => {
    return moment(ts).toISOString();
};

export const getUTCFromLocal = (ts: MomentInput) => {
    const time = moment(ts);
    time.add(-time.utcOffset(), 'm');
    return time.valueOf();
};

export const getTimestampFromDate = (date: MomentInput) => {
    return moment(date).valueOf();
};

// const minimalFromToDiff = 60000;
const nowRe = /^now(?:([+-]\d+)([a-zA-Z]))?(?:\/([a-zA-Z]))?$/;

const rangeMap: Record<string, 'M' | undefined> = {
    mo: 'M',
};

export const calculateBackTimestamp = (back: string, ts?: MomentInput) => {
    const time = moment(ts);
    const backRe = /(-?\d+)([a-zA-Z]+)/g;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const match = backRe.exec(back);
        if (match) {
            const [, amount, rawRange] = match; // eslint-disable-line no-unused-vars
            const range = rangeMap[rawRange] || (rawRange as unitOfTime.DurationConstructor);
            time.subtract(amount, range);
        } else {
            break;
        }
    }
    return time.valueOf();
};

export const calculateShortcutTime = (shortcut: string) => {
    const from = Date.now();
    const to = calculateBackTimestamp(shortcut, from);
    return from < to ? {from, to} : {from: to, to: from};
};

export const calculateTimestamp = (ts: string | number) => {
    if (!isNaN(ts as number)) {
        return Number(ts);
    }
    const match = nowRe.exec(ts as string);
    if (match) {
        const [, amount, range, roundRange] = match; // eslint-disable-line no-unused-vars
        const time = moment();
        if (amount) {
            time.add(amount, range as unitOfTime.DurationConstructor);
        }
        if (roundRange) {
            time.startOf(roundRange as unitOfTime.StartOf);
        }
        return time.valueOf();
    } else {
        return null;
    }
};

export function convertTimeToRequestParams(time: {
    from?: number;
    to?: number;
    shortcut?: string;
    shortcutValue?: string;
}) {
    if (!time) {
        return undefined;
    }

    const {from, to, shortcutValue} = time;
    return shortcutValue ? calculateShortcutTime(shortcutValue) : {from, to};
}
