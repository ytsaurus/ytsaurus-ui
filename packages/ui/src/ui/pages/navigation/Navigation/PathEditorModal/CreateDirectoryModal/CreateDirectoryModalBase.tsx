import React from 'react';

import PathEditorModal from '../PathEditorModal';

import i18n from './i18n';

import {CLOSE_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';
import {Checkbox} from '@gravity-ui/uikit';
import {type YTError} from '../../../../../types';

type State = {
    recursive: boolean;
};

type ReduxProps = {
    popupVisible: boolean;
    errorMessage: string;
    error: YTError;
    showError: boolean;
    creating: boolean;
    creatingPath: string;
    updateView: (settings?: {trackVisit?: boolean} | undefined) => void;
    abortRequests: () => void;
    createDirectory(args: {path: string; recursive?: boolean}, onSuccess: () => void): void;
    closeEditingPopup(type: string): void;
    clearCreateDirectoryError: () => void;
};

export class CreateDirectoryModalBase extends React.Component<ReduxProps> {
    override state: State = {
        recursive: false,
    };

    override render() {
        const {popupVisible, creating, creatingPath, showError, errorMessage, error} = this.props;

        const modalTitle = i18n('title_create-directory');
        const title = i18n('title_enter-name');
        const description = i18n('context_new-object-path');
        const placeholder = i18n('context_enter-directory-path');

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
                        {i18n('action_make-parent-dirs')}
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
