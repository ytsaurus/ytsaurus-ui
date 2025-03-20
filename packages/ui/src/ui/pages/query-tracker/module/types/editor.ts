import {YTError} from '../../../../types';

export type QTEditorError = YTError<{
    attributes: {
        end_position: {
            column: number;
            row: number;
        };
        start_position: {
            column: number;
            row: number;
        };
    };
}>;

export function isQTEditorError(error?: YTError<{attributes?: object}>): error is QTEditorError {
    if (
        error?.attributes &&
        'end_position' in error.attributes &&
        'start_position' in error.attributes
    ) {
        return true;
    }
    return false;
}
