import {YTError} from '../../../../types';

export interface QTEditorError extends YTError {
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
}
