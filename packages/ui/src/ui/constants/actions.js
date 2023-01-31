import createActionTypes, {createPrefix} from './utils';

const PREFIX = createPrefix('ACTIONS');

export const PROMPT_ACTION = PREFIX + 'PROMPT';
export const DISMISS_ACTION = PREFIX + 'DISMISS';
export const CONFIRM_ACTION = createActionTypes(PREFIX + 'CONFIRM');

export const MODAL_STATES = {
    HIDDEN: 'hidden',
    PROMPT: 'prompt',
    PENDING: 'pending',
    FAILED: 'failed',
    SUCCEEDED: 'succeeded',
};
