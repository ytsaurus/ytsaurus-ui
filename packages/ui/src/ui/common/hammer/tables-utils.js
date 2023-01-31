export const STORAGE_KEY_SIMILAR = 'SAVED_COLUMN_SETS';
export const STORAGE_KEY = 'SAVED_COLUMN_SETS_DIRECT';

export class StorageBoundExceededError extends Error {
    constructor(message) {
        super(message);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StorageBoundExceededError);
        }
    }
}
