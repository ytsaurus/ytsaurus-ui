import {CLOSE_MOVE_OBJECT_POPUP} from '../../../../../constants/navigation/modals/move-object';
import {useGeneralModal} from '../useGeneralModal';
import type {MoveObjectModalProps} from './types';

type Props = MoveObjectModalProps;

export const useMoveObjectModal = (props: Props) => {
    const defaultAfterMoveStrategy = 'refresh';

    const {
        popupVisible,
        renaming,
        movedPath,
        showError,
        errorMessage,
        error,
        multipleMode,
        objectPath,
        afterMoveStrategy,
        items,
        abortRequests,
        updatePath,
        updateView,
        moveObject,
        closeEditingPopup,
    } = props;

    const modalTitle = 'Move';
    const title = multipleMode
        ? 'Enter a new path for objects.'
        : 'Enter a new path for the object.';
    const description = multipleMode
        ? 'Objects will be moved with the specified path.'
        : 'The object will be moved with the specified path.';
    const placeholder = 'Enter a new object path...';

    const doMove = (
        toPath: string,
        checkboxes: {preserveAccount: boolean; force: boolean},
        resetOptions: () => void,
    ) => {
        const {preserveAccount, force} = checkboxes;

        const onSucess = (destinationPath: string) => {
            if (destinationPath && (afterMoveStrategy ?? defaultAfterMoveStrategy) === 'redirect') {
                updatePath(destinationPath);
                return;
            }
            updateView();
        };

        moveObject(
            objectPath,
            toPath,
            onSucess,
            multipleMode,
            items,
            {
                preserve_account: preserveAccount,
            },
            force,
            resetOptions,
        );
    };

    const general = useGeneralModal({
        inProcess: renaming,
        whatObjectToClose: CLOSE_MOVE_OBJECT_POPUP,
        showError,
        pathTo: movedPath,
        abortRequests,
        handleAction: doMove,
        closeEditingPopup,
    });

    return {
        ...general,
        title,
        description,
        placeholder,
        modalTitle,
        movedPath,
        errorMessage,
        error,
        popupVisible,
        showError,
        renaming,
    };
};
