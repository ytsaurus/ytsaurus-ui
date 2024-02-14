import createActionTypes, {createPrefix} from '../../../../constants/utils';

const PREFIX = createPrefix('query-tracker/QUERY_ACO');

export const QUERY_ACO_LOADING = createActionTypes(PREFIX + 'LOADING');
