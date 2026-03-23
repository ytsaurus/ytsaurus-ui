import {dateTime} from '../utils/date-utils';

enum DateSortValue {
    Nullish = -2,
    Invalid = -1,
}

export const formatDateForTableSort = (date: unknown): number => {
    if (date === null || date === undefined) {
        return DateSortValue.Nullish;
    }

    if (date instanceof Date) {
        return isNaN(date.getTime()) ? DateSortValue.Invalid : date.getTime();
    }

    if (typeof date === 'string') {
        const formattedDate = dateTime({input: date});
        return formattedDate.isValid() ? formattedDate.toDate().getTime() : DateSortValue.Invalid;
    }

    return DateSortValue.Nullish;
};
