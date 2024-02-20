import {useState} from 'react';

const DEFAULT_CHECKBOXES = {preserveAccount: false, force: false};

type Props = {
    showError: boolean;
    inProcess: boolean;
    whatObjectToClose: string;
    closeEditingPopup: (str: string) => void;
    abortRequests: () => void;
    pathTo: string;
    handleAction: (
        newPath: string,
        checkboxesValue: typeof DEFAULT_CHECKBOXES,
        resetCheckboxes: () => void,
    ) => void;
};

export const useGeneralModal = ({
    inProcess,
    showError,
    whatObjectToClose,
    pathTo,
    handleAction,
    closeEditingPopup,
    abortRequests,
}: Props) => {
    const checkboxes = useState(DEFAULT_CHECKBOXES);
    const [checkboxesValue, setCheckboxesValue] = checkboxes;

    const resetCheckboxes = () => setCheckboxesValue(DEFAULT_CHECKBOXES);

    const doAction = (newPath: string) => handleAction(newPath, checkboxesValue, resetCheckboxes);

    const handleApply = (newPath: string) => {
        const disabled = inProcess || showError;

        if (!disabled) {
            doAction(newPath);
        }
    };

    const handleCancelButtonClick = () => {
        resetCheckboxes();
        closeEditingPopup(whatObjectToClose);
        abortRequests();
    };

    const handleConfirmButtonClick = () => {
        doAction(pathTo);
    };

    return {
        checkboxes,
        handleConfirmButtonClick,
        handleApply,
        handleCancelButtonClick,
        resetCheckboxes,
    };
};
