import createActionTypes, {createPrefix} from '../utils';

const PREFIX = createPrefix('GLOBAL');

export const LOAD_ATTRIBUTES = createActionTypes(`${PREFIX}LOAD_ATTRIBUTES`);
export const OPEN_ATTRIBUTES_MODAL = `${PREFIX}OPEN_ATTRIBUTES_MODAL` as const;
export const CLOSE_ATTRIBUTES_MODAL = `${PREFIX}CLOSE_ATTRIBUTES_MODAL` as const;
