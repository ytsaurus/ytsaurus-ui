import createActionTypes, {createPrefix} from '../../constants/utils';
import {Page} from '../../constants/index';

const PREFIX = createPrefix(Page.OPERATIONS, 'jobs');
export const GET_JOBS = createActionTypes(`${PREFIX}GET_JOBS`);
export const GET_JOB = createActionTypes(`${PREFIX}GET_JOB`);
export const GET_COMPETITIVE_JOBS = createActionTypes(`${PREFIX}GET_COMPETITIVE_JOBS`);
export const RESET_COMPETITIVE_JOBS = `${PREFIX}RESET_COMPETITIVE_JOBS` as const;
export const JOB_LIST_UPDATE_FILTER = `${PREFIX}UPDATE_FILTER` as const;
export const UPDATE_OFFSET = `${PREFIX}UPDATE_OFFSET` as const;
export const JOBS_PER_PAGE_LIMIT = 20;
export const EXTRA_JOBS_COUNT = 1;
export const OPERATION_JOBS_TABLE_ID = 'operations/detail/jobs';

export const SHOW_INPUT_PATHS = createActionTypes(`${PREFIX}SHOW_INPUT_PATHS`);
export const HIDE_INPUT_PATHS = `${PREFIX}HIDE_INPUT_PATHS` as const;
export const UPDATE_FILTER_COUNTERS = `${PREFIX}UPDATE_FILTER_COUNTERS` as const;
