import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';
import {
    abortRequests,
    createDirectory,
} from '../../../../../store/actions/navigation/modals/create-directory';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';
import {YTError} from '../../../../../../@types/types';
import {RootState} from '../../../../../store/reducers';

type CreateDirecotryProps = {
    error: YTError;
    errorMessage: string;
    popupVisible: boolean;
    showError: boolean;

    creating?: boolean;
    creatingPath: string;

    updateView: () => void;
    abortRequests: () => void;
    createDirectory: (path: string, updateCb: () => void) => void;
    closeEditingPopup: (popupId: string) => void;
};

class CreateDirectoryModal extends React.Component<CreateDirecotryProps> {
    static propTypes = {
        // from connect
        error: PropTypes.shape({
            code: PropTypes.number,
            message: PropTypes.string,
        }).isRequired,
        errorMessage: PropTypes.string.isRequired,
        popupVisible: PropTypes.bool.isRequired,
        showError: PropTypes.bool.isRequired,
        creating: PropTypes.bool.isRequired,
        creatingPath: PropTypes.string.isRequired,

        updateView: PropTypes.func.isRequired,
        abortRequests: PropTypes.func.isRequired,
        createDirectory: PropTypes.func.isRequired,
        closeEditingPopup: PropTypes.func.isRequired,
    };

    render() {
        const {popupVisible, creating, creatingPath, showError, errorMessage, error} = this.props;

        const modalTitle = 'Create Directory';
        const title = 'Enter a name for the new directory.';
        const description = 'The new object will be created at the specified path.';
        const placeholder = 'Enter a new directory path...';

        return (
            <PathEditorModal
                title={title}
                description={description}
                placeholder={placeholder}
                modalTitle={modalTitle}
                editingPath={creatingPath}
                errorMessage={errorMessage}
                error={error}
                visible={popupVisible}
                showError={showError}
                inProcess={creating}
                onConfirmButtonClick={this.handleConfirmButtonClick}
                onCancelButtonClick={this.handleCancelButtonClick}
                onApply={this.handleApply}
            />
        );
    }

    handleConfirmButtonClick = () => {
        const {creatingPath, createDirectory, updateView} = this.props;

        createDirectory(creatingPath, updateView);
    };

    handleCancelButtonClick = () => {
        this.props.closeEditingPopup(CLOSE_CREATE_DIRECTORY_POPUP);
        this.props.abortRequests();
    };

    handleApply = (newPath: string) => {
        const {creating, showError, createDirectory, updateView} = this.props;
        const disabled = creating || showError;

        if (!disabled) {
            createDirectory(newPath, updateView);
        }
    };
}

const mapStateToProps = (state: RootState) => {
    const {creatingPath, popupVisible, showError, creating, errorMessage, error} =
        state.navigation.modals.createDirectory;

    return {
        popupVisible,
        errorMessage,
        error,
        showError,
        creating,
        creatingPath,
    };
};

const mapDispatchToProps = {
    updateView,
    abortRequests,
    createDirectory,
    closeEditingPopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateDirectoryModal);
