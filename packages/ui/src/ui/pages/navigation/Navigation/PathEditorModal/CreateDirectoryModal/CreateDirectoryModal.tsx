import {connect} from 'react-redux';
import {
    abortRequests,
    clearCreateDirectoryError,
    createDirectory,
} from '../../../../../store/actions/navigation/modals/create-directory';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';
import {type RootState} from '../../../../../store/reducers';

import {CreateDirectoryModalBase} from './CreateDirectoryModalBase';

const mapStateToProps = (state: RootState) => {
    const {creatingPath, popupVisible, showError, creating, errorMessage, error} =
        state.navigation.modals.createDirectory;

    return {
        popupVisible,
        errorMessage,
        error,
        showError,
        creating,
        creatingPath: creatingPath as string,
    };
};

const mapDispatchToProps = {
    updateView,
    abortRequests,
    createDirectory,
    closeEditingPopup,
    clearCreateDirectoryError,
};

const CreateDirectoryModal = connect(mapStateToProps, mapDispatchToProps)(CreateDirectoryModalBase);

export default CreateDirectoryModal;
