import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';
import {
    createDirectory,
    abortRequests,
} from '../../../../../store/actions/navigation/modals/create-directory';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';

class CreateDirectoryModal extends Component {
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

    handleConfirmButtonClick = () => {
        const {creatingPath, createDirectory, updateView} = this.props;

        createDirectory(creatingPath, updateView);
    };

    handleCancelButtonClick = () => {
        const {abortRequests, closeEditingPopup} = this.props;

        closeEditingPopup(CLOSE_CREATE_DIRECTORY_POPUP);
        abortRequests();
    };

    handleApply = (newPath) => {
        const {creating, showError, createDirectory, updateView} = this.props;
        const disabled = creating || showError;

        if (!disabled) {
            createDirectory(newPath, updateView);
        }
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
}

const mapStateToProps = ({navigation}) => {
    const {creatingPath, popupVisible, showError, creating, errorMessage, error} =
        navigation.modals.createDirectory;

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
