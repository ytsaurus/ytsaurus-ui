import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_COPY_OBJECT_POPUP} from '../../../../../constants/navigation/modals/copy-object';
import {
    copyObject,
    abortRequests,
} from '../../../../../store/actions/navigation/modals/copy-object';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';
import {Checkbox} from '@gravity-ui/uikit';

class CopyObjectModal extends Component {
    static propTypes = {
        // from connect
        error: PropTypes.shape({
            code: PropTypes.number,
            message: PropTypes.string,
        }).isRequired,
        items: PropTypes.array.isRequired,
        errorMessage: PropTypes.string.isRequired,
        copyPath: PropTypes.string.isRequired,
        objectPath: PropTypes.string.isRequired,
        copying: PropTypes.bool.isRequired,
        showError: PropTypes.bool.isRequired,
        multipleMode: PropTypes.bool.isRequired,
        popupVisible: PropTypes.bool.isRequired,

        updateView: PropTypes.func.isRequired,
        copyObject: PropTypes.func.isRequired,
        abortRequests: PropTypes.func.isRequired,
        closeEditingPopup: PropTypes.func.isRequired,
    };

    state = {preserve_account: false};

    handleConfirmButtonClick = () => {
        const {copyPath} = this.props;
        this.doCopy(copyPath);
    };

    handleCancelButtonClick = () => {
        const {closeEditingPopup, abortRequests} = this.props;

        this.resetOptions();
        closeEditingPopup(CLOSE_COPY_OBJECT_POPUP);
        abortRequests();
    };

    handleApply = (newPath) => {
        const {copying, showError} = this.props;
        const disabled = copying || showError;

        if (!disabled) {
            this.doCopy(newPath);
        }
    };

    doCopy(toPath) {
        const {copyObject, updateView, objectPath, multipleMode, items} = this.props;
        const {preserve_account} = this.state;

        copyObject(objectPath, toPath, updateView, multipleMode, items, {preserve_account}).then(
            () => this.resetOptions(),
        );
    }

    render() {
        const {popupVisible, copying, copyPath, showError, errorMessage, error, multipleMode} =
            this.props;

        const modalTitle = 'Copy';
        const title = multipleMode
            ? 'Enter a destination path for copied objects.'
            : 'Enter a destination path for the copied object.';
        const description = multipleMode
            ? 'Objects will be copied with the specified path.'
            : 'The object will be copied with the specified path.';
        const placeholder = 'Enter a destination path for the copied object...';

        return (
            <PathEditorModal
                title={title}
                description={description}
                placeholder={placeholder}
                modalTitle={modalTitle}
                visible={popupVisible}
                inProcess={copying}
                editingPath={copyPath}
                showError={showError}
                error={error}
                options={this.renderOptions()}
                errorMessage={errorMessage}
                onConfirmButtonClick={this.handleConfirmButtonClick}
                onCancelButtonClick={this.handleCancelButtonClick}
                onApply={this.handleApply}
            />
        );
    }

    renderOptions() {
        return <Checkbox onUpdate={this.onUpdatePreserveAccount}>Preserve account</Checkbox>;
    }

    resetOptions() {
        this.onUpdatePreserveAccount(false);
    }

    onUpdatePreserveAccount = (preserve_account) => {
        this.setState({preserve_account});
    };
}

const mapStateToProps = ({navigation}) => {
    const {
        copyPath,
        objectPath,
        popupVisible,
        showError,
        copying,
        errorMessage,
        error,
        multipleMode,
        items,
    } = navigation.modals.copyObject;

    return {
        items,
        multipleMode,
        copyPath,
        copying,
        popupVisible,
        errorMessage,
        error,
        showError,
        objectPath,
    };
};

const mapDispatchToProps = {
    updateView,
    copyObject,
    abortRequests,
    closeEditingPopup,
};

export default connect(mapStateToProps, mapDispatchToProps)(CopyObjectModal);
