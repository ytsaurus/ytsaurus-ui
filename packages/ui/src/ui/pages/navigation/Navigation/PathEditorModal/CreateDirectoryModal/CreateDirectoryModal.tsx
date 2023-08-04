import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';
import {
    abortRequests,
    clearCreateDirectoryError,
    createDirectory,
} from '../../../../../store/actions/navigation/modals/create-directory';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';
import {RootState} from '../../../../../store/reducers';
import {Checkbox} from '@gravity-ui/uikit';

type State = {
    recursive: boolean;
};

type ReduxProps = ConnectedProps<typeof connector>;

class CreateDirectoryModal extends React.Component<ReduxProps> {
    state: State = {
        recursive: false,
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
                options={
                    <Checkbox checked={this.state.recursive} onUpdate={this.onRecursiveUpdate}>
                        Make parent directories as needed
                    </Checkbox>
                }
            />
        );
    }

    onRecursiveUpdate = (recursive: boolean) => {
        this.setState({recursive});
        this.props.clearCreateDirectoryError?.();
    };

    handleConfirmButtonClick = () => {
        const {creatingPath, createDirectory, updateView} = this.props;

        createDirectory({path: creatingPath, recursive: this.state.recursive}, updateView);
    };

    handleCancelButtonClick = () => {
        this.props.closeEditingPopup(CLOSE_CREATE_DIRECTORY_POPUP);
        this.props.abortRequests();
    };

    handleApply = (newPath: string) => {
        const {creating, showError, createDirectory, updateView} = this.props;
        const disabled = creating || showError;

        if (!disabled) {
            createDirectory({path: newPath, recursive: this.state.recursive}, updateView);
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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CreateDirectoryModal);
