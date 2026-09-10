import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PathEditorModal from '../PathEditorModal';

import i18n from './i18n';

import {CLOSE_MOVE_OBJECT_POPUP} from '../../../../../constants/navigation/modals/move-object';
import {Checkbox} from '@gravity-ui/uikit';

export class MoveObjectModalBase extends Component {
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

        const modalTitle = i18n('title_move');
        const title = multipleMode
            ? i18n('title_enter-path-objects')
            : i18n('title_enter-path-object');
        const description = multipleMode
            ? i18n('confirm_objects-moved')
            : i18n('confirm_object-moved');
        const placeholder = i18n('action_enter-path');

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
                title={i18n('action_preserve-account')}
                checked={this.state.preserve_account}
                onUpdate={this.onUpdatePreserveAccount}
            >
                {i18n('action_preserve-account')}
            </Checkbox>
        );
    }

    resetOptions() {
        this.onUpdatePreserveAccount(false);
    }

    onUpdatePreserveAccount = (preserve_account) => this.setState({preserve_account});
}
