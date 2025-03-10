import {YTError} from '../../types';

export class UIBatchError implements YTError {
    message: string;

    code?: number;
    attributes?: any;
    inner_errors?: YTError[];

    constructor(msg: string) {
        this.message = msg;

        delete this.code;
        delete this.attributes;
        delete this.inner_errors;
    }
}
