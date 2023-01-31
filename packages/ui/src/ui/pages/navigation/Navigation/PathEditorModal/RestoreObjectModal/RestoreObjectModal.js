import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_RESTORE_POPUP} from '../../../../../constants/navigation/modals/restore-object';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {restoreObject} from '../../../../../store/actions/navigation/modals/restore-object';
import {updateView} from '../../../../../store/actions/navigation';

class RestoreObjectModal extends Component {
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

        const modalTitle = 'Restore';
        const title = 'Object with the same path is already exists.';
        const description =
            'The object will be restored using a new path or you can change path to what you want.';
        const placeholder = 'Enter restored object path...';

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

const mapStateToProps = ({navigation}) => {
    const {restoredPath, objectPath, popupVisible, showError, restoring, errorMessage, error} =
        navigation.modals.restoreObject;

    return {
        restoredPath,
        restoring,
        popupVisible,
        errorMessage,
        error,
        showError,
        objectPath,
    };
};

const mapDispatchToProps = {
    updateView,
    restoreObject,
    closeEditingPopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(RestoreObjectModal);
