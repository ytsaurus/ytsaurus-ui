import {UPDATE_FILTER} from '../../../../constants/navigation/tabs/schema';

export function updateFilter(column) {
    return {
        type: UPDATE_FILTER,
        data: {column},
    };
}
