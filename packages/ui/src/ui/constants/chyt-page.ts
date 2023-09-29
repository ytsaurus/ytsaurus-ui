import createActionTypes, {createPrefix} from './utils';

const CHYT_PREFIX = createPrefix('CHYT');

export const CHYT_LIST = createActionTypes(CHYT_PREFIX + 'FETCH_ACCOUNTS_RESOURCE');

export const CHYT_LIST_FILTERS = 'CHYT_LIST_FILTERS';

export const ChytPageTab = {
    LIST: 'list',
};
