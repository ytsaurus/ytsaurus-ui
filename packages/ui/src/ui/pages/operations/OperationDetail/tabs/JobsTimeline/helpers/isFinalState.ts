export const COMPLETED_STATES = ['completed', 'failed', 'aborted'] as const;

export const isFinalState = (state: string): boolean =>
    (COMPLETED_STATES as readonly string[]).includes(state);
