import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PathEditorModal from '../PathEditorModal';

import {CircleQuestion} from '@gravity-ui/icons';
import {Checkbox, Flex} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {CLOSE_MOVE_OBJECT_POPUP} from '../../../../../constants/navigation/modals/move-object';
import {updatePath, updateView} from '../../../../../store/actions/navigation';
import {
    abortRequests,
    moveObject,
} from '../../../../../store/actions/navigation/modals/move-object';
import {
    closeEditingPopup,
    hideError,
} from '../../../../../store/actions/navigation/modals/path-editing-popup';
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

        hideError: PropTypes.func.isRequired,
    };

    static defaultProps = {
        afterMoveStrategy: 'refresh',
    };

    state = {preserve_account: false, force: false};

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

        moveObject(
            objectPath,
            toPath,
            onSucess,
            multipleMode,
            items,
            {
                preserve_account,
            },
            this.state.force,
        ).then(() => this.resetOptions());
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
            <Flex direction="column" gap={2}>
                <Checkbox
                    title={'Preserve account'}
                    checked={this.state.preserve_account}
                    onUpdate={this.onUpdatePreserveAccount}
                >
                    Preserve account
                </Checkbox>
                <Flex gap={2}>
                    <Checkbox
                        title={'Override'}
                        checked={this.state.force}
                        onUpdate={this.onUpdateForce}
                        content="Override"
                    >
                        Override
                    </Checkbox>
                    <Tooltip content="Will replace file if it exists">
                        <CircleQuestion style={{color: 'grey'}} />
                    </Tooltip>
                </Flex>
            </Flex>
        );
    }

    resetOptions() {
        this.onUpdatePreserveAccount(false);
    }

    onUpdatePreserveAccount = (preserve_account) =>
        this.setState({...this.state, preserve_account});
    onUpdateForce = (force) => {
        this.setState({...this.state, force});
        this.props.hideError();
    };
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
        hideError,
        afterMoveStrategy: entityPath === path ? 'redirect' : 'refresh',
    };
};

const mapDispatchToProps = {
    closeEditingPopup,
    abortRequests,
    moveObject,
    updateView,
    updatePath,
    hideError,
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveObjectModal);
