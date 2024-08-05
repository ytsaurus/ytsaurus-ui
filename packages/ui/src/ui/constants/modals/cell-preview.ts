import createActionTypes from '../utils';

export const PREVIEW_LIMIT = 16 * 1024 * 1024; // 16MiB;

export const CELL_PREVIEW = createActionTypes('CELL_PREVIEW');
