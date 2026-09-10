import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import i18n from './i18n';

import {CLOSE_RESTORE_POPUP} from '../../../../../constants/navigation/modals/restore-object';

export class RestoreObjectModalBase extends Component {
    static propTypes = {
        // from connect
        error: PropTypes.shape({
            code: PropTypes.number,
            message: PropTypes.string,
        }).isRequired,
        errorMessage: PropTypes.string.isRequired,
        restoredPath: PropTypes.string.isRequired,
        objectPath: PropTypes.string.isRequired,
        restoring: PropTypes.bool.isRequired,
        showError: PropTypes.bool.isRequired,
        popupVisible: PropTypes.bool.isRequired,

        updateView: PropTypes.func.isRequired,
        restoreObject: PropTypes.func.isRequired,
        closeEditingPopup: PropTypes.func.isRequired,
    };

    handleConfirmButtonClick = () => {
        const {restoreObject, objectPath, restoredPath, updateView} = this.props;

        restoreObject(objectPath, restoredPath, updateView);
    };

    handleCancelButtonClick = () => this.props.closeEditingPopup(CLOSE_RESTORE_POPUP);

    handleApply = (newPath) => {
        const {restoreObject, objectPath, showError, restoring, updateView} = this.props;
        const disabled = restoring || showError;

        if (!disabled) {
            restoreObject(objectPath, newPath, updateView);
        }
    };

    render() {
        const {popupVisible, restoring, restoredPath, showError, errorMessage, error} = this.props;

        const modalTitle = i18n('title_restore');
        const title = i18n('title_object-already-exists');
        const description = i18n('context_restore-description');
        const placeholder = i18n('action_enter-restored-path');

        return (
            <PathEditorModal
                title={title}
                description={description}
                placeholder={placeholder}
                modalTitle={modalTitle}
                visible={popupVisible}
                inProcess={restoring}
                editingPath={restoredPath}
                showError={showError}
                errorMessage={errorMessage}
                error={error}
                onConfirmButtonClick={this.handleConfirmButtonClick}
                onCancelButtonClick={this.handleCancelButtonClick}
                onApply={this.handleApply}
            />
        );
    }
}
