import {FIX_MY_TYPE} from '../../../../../../@types/types';
import {copyObject} from '../../../../../store/actions/navigation/modals/copy-object';

export type CopyObjectModalProps = {
    // from connect
    error: {
        code: number;
        message: string;
    };
    items: FIX_MY_TYPE[];
    errorMessage: string;
    copyPath: string;
    objectPath: string;
    copying: boolean;
    showError: boolean;
    multipleMode: boolean;
    popupVisible: boolean;

    updateView: () => void;
    copyObject: typeof copyObject;
    abortRequests: () => void;
    closeEditingPopup: (str: string) => void;
};
