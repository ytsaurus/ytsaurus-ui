const COMPLETED_STATES = ['completed', 'failed', 'aborted'];

export const isFinalState = (state: string) => COMPLETED_STATES.indexOf(state) !== -1;
