import {YTError} from '../../types';

export class UIBatchError implements YTError {
    message: string;

    code?: number;
    attributes?: any;
    inner_errors?: YTError[];

    /**
     * !!! Do not remove the field!!!
     * The field is required to indicate the difference between the UIBatchError and YTerror interfaces
     * in order to force the use of UIBatchError instead of YTError due to a compiler error.
     */
    __use_UIBatchError_instead_of_YTERROR?: boolean;

    constructor(msg: string) {
        this.message = msg;
    }
}
