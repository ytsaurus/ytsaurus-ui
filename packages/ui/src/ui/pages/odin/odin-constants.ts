import createActionTypes from '../../constants/utils';

export {ODIN_PAGE_ID} from '../../../shared/constants';
export const ODIN_CELL_SIZE = 20;

const PREFIX = 'ODIN:';

export const ODIN_DATA_FIELDS = PREFIX + 'ODIN_DATA_FIELDS';

export const GET_METRIC_DATA = createActionTypes(PREFIX + 'GET_METRIC_DATA');

export const SET_METRIC = PREFIX + 'METRIC';
export const TOGGLE_USE_CURRENT_DATE = PREFIX + 'TOGGLE_USE_CURRENT_DATE';
export const SET_DATE = PREFIX + 'SET_DATE';
export const SET_HOURS_MINUTES = PREFIX + 'HOURS_MINUTES';

export const ROWS_NUMBER = 24;
export const COLS_NUMBER = 60;

export const DATE_FORMAT = 'YYYY-MM-DD';

export const OdinTab = {
    OVERVIEW: 'overview',
    DETAILS: 'details',
};

export const ODIN_OVERVIEW_REQUEST = 'ODIN_OVERVIEW_REQUEST';
export const ODIN_OVERVIEW_FAILED = 'ODIN_OVERVIEW_FAILED';
export const ODIN_OVERVIEW_CANCELLED = 'ODIN_OVERVIEW_CANCELLED';
export const ODIN_OVERVIEW_SUCCESS = 'ODIN_OVERVIEW_SUCCESS';
export const ODIN_OVERVIEW_PARTIAL = 'ODIN_OVERVIEW_PARTIAL';
export const ODIN_OVERVIEW_HIDDEN_METRICS = 'ODIN_OVERVIEW_HIDDEN_METRICS';
