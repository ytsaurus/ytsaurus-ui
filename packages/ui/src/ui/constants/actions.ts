import createActionTypes, {createPrefix} from './utils';

const PREFIX = createPrefix('ACTIONS');

export const PROMPT_ACTION = `${PREFIX}PROMPT` as const;
export const DISMISS_ACTION = `${PREFIX}DISMISS` as const;
const {REQUEST, FAILURE} = createActionTypes(`${PREFIX}CONFIRM`);
export const CONFIRM_ACTION = {REQUEST, FAILURE} as const;

export const MODAL_STATES = {
    HIDDEN: 'hidden',
    PROMPT: 'prompt',
    PENDING: 'pending',
    FAILED: 'failed',
} as const;
