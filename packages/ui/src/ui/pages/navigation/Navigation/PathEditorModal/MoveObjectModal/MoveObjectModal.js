import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import {CLOSE_MOVE_OBJECT_POPUP} from '../../../../../constants/navigation/modals/move-object';
import {
    moveObject,
    abortRequests,
} from '../../../../../store/actions/navigation/modals/move-object';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView, updatePath} from '../../../../../store/actions/navigation';
import {Checkbox} from '@gravity-ui/uikit';
import {getPath} from '../../../../../store/selectors/navigation';

class MoveObjectModal extends Component {
    static propTypes = {
        // from connect
        error: PropTypes.shape({
            code: PropTypes.number,
            message: PropTypes.string,
        }).isRequired,
        afterMoveStrategy: PropTypes.oneOf(['refresh', 'redirect']),
        items: PropTypes.array.isRequired,
        errorMessage: PropTypes.string.isRequired,
        objectPath: PropTypes.string.isRequired,
        popupVisible: PropTypes.bool.isRequired,
        multipleMode: PropTypes.bool.isRequired,
        movedPath: PropTypes.string.isRequired,
        showError: PropTypes.bool.isRequired,
        renaming: PropTypes.bool.isRequired,

        closeEditingPopup: PropTypes.func.isRequired,
        abortRequests: PropTypes.func.isRequired,
        moveObject: PropTypes.func.isRequired,
        updateView: PropTypes.func.isRequired,
        updatePath: PropTypes.func.isRequired,
    };

    static defaultProps = {
        afterMoveStrategy: 'refresh',
    };

    state = {preserve_account: false};

    handleConfirmButtonClick = () => {
        const {movedPath} = this.props;
        this.doMove(movedPath);
    };

    handleCancelButtonClick = () => {
        const {closeEditingPopup, abortRequests} = this.props;

        this.resetOptions();
        closeEditingPopup(CLOSE_MOVE_OBJECT_POPUP);
        abortRequests();
    };

    handleApply = (newPath) => {
        const {renaming, showError} = this.props;
        const disabled = renaming || showError;

        if (!disabled) {
            this.doMove(newPath);
        }
    };

    doMove(toPath) {
        const {
            moveObject,
            objectPath,
            afterMoveStrategy,
            updateView,
            updatePath,
            multipleMode,
            items,
        } = this.props;
        const {preserve_account} = this.state;

        const onSucess = (destinationPath) => {
            if (destinationPath && afterMoveStrategy === 'redirect') {
                updatePath(destinationPath);
                return;
            }
            updateView();
        };

        moveObject(objectPath, toPath, onSucess, multipleMode, items, {
            preserve_account,
        }).then(() => this.resetOptions());
    }

    render() {
        const {popupVisible, renaming, movedPath, showError, errorMessage, error, multipleMode} =
            this.props;

        const modalTitle = 'Move';
        const title = multipleMode
            ? 'Enter a new path for objects.'
            : 'Enter a new path for the object.';
        const description = multipleMode
            ? 'Objects will be moved with the specified path.'
            : 'The object will be moved with the specified path.';
        const placeholder = 'Enter a new object path...';

        return (
            <PathEditorModal
                title={title}
                description={description}
                placeholder={placeholder}
                modalTitle={modalTitle}
                editingPath={movedPath}
                errorMessage={errorMessage}
                error={error}
                visible={popupVisible}
                showError={showError}
                inProcess={renaming}
                options={this.renderOptions()}
                onConfirmButtonClick={this.handleConfirmButtonClick}
                onCancelButtonClick={this.handleCancelButtonClick}
                onApply={this.handleApply}
            />
        );
    }

    renderOptions() {
        return (
            <Checkbox
                title={'Preserve account'}
                checked={this.state.preserve_account}
                onUpdate={this.onUpdatePreserveAccount}
            >
                Preserve account
            </Checkbox>
        );
    }

    resetOptions() {
        this.onUpdatePreserveAccount(false);
    }

    onUpdatePreserveAccount = (preserve_account) => this.setState({preserve_account});
}

const mapStateToProps = (state) => {
    const {navigation} = state;
    const path = getPath(state);
    const {
        error,
        errorMessage,
        popupVisible,
        showError,
        renaming,
        movedPath,
        objectPath,
        multipleMode,
        items,
    } = navigation.modals.moveObject;

    const entityPath = !multipleMode ? objectPath : items.length !== 1 ? undefined : items[0]?.path;

    return {
        error,
        errorMessage,
        popupVisible,
        showError,
        renaming,
        movedPath,
        objectPath,
        multipleMode,
        items,
        afterMoveStrategy: entityPath === path ? 'redirect' : 'refresh',
    };
};

const mapDispatchToProps = {
    closeEditingPopup,
    abortRequests,
    moveObject,
    updateView,
    updatePath,
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveObjectModal);
