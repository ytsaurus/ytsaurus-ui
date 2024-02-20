import {CLOSE_COPY_OBJECT_POPUP} from '../../../../../constants/navigation/modals/copy-object';
import {useGeneralModal} from '../useGeneralModal';
import {CopyObjectModalProps} from './types';

type Props = CopyObjectModalProps;

export const useCopyObjectModal = ({
    multipleMode,
    objectPath,
    updateView,
    abortRequests,
    copyObject,
    items,
    copyPath,
    copying,
    showError,
    closeEditingPopup,
}: Props) => {
    const modalTitle = 'Copy';
    const title = multipleMode
        ? 'Enter a destination path for copied objects.'
        : 'Enter a destination path for the copied object.';
    const description = multipleMode
        ? 'Objects will be copied with the specified path.'
        : 'The object will be copied with the specified path.';
    const placeholder = 'Enter a destination path for the copied object...';

    const doCopy = (
        newPath: string,
        checkboxes: {preserveAccount: boolean},
        resetOptions: () => void,
    ) => {
        const {preserveAccount} = checkboxes;

        copyObject(
            objectPath,
            newPath,
            updateView,
            multipleMode,
            items,
            {preserve_account: preserveAccount},
            resetOptions,
        );
    };

    const general = useGeneralModal({
        inProcess: copying,
        pathTo: copyPath,
        showError,
        whatObjectToClose: CLOSE_COPY_OBJECT_POPUP,
        abortRequests,
        closeEditingPopup,
        handleAction: doCopy,
    });

    return {...general, title, modalTitle, description, placeholder};
};
