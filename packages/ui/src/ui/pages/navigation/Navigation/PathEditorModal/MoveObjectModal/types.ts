import {moveObject} from '../../../../../store/actions/navigation/modals/move-object';

export type MoveObjectModalProps = {
    error: {
        code: number;
        message: string;
    };
    afterMoveStrategy: 'refresh' | 'redirect';
    items: any[];
    errorMessage: string;
    objectPath: string;
    popupVisible: boolean;
    multipleMode: boolean;
    movedPath: string;
    showError: boolean;
    renaming: boolean;
    closeEditingPopup: (str: string) => void;
    abortRequests: () => void;
    moveObject: typeof moveObject;
    updateView: () => void;
    updatePath: (destinationPath: string) => void;
    hideError: () => void;
};
