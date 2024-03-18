import React, {FC} from 'react';
import {connect} from 'react-redux';

import PathEditorModal from '../PathEditorModal';

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
import {ObjectActionCheckboxes} from '../ObjectActionCheckboxes';
import {MoveObjectModalProps} from './types';
import {useMoveObjectModal} from './useMoveObjectModal';

const MoveObjectModal: FC<MoveObjectModalProps> = (props) => {
    const {
        title,
        description,
        placeholder,
        modalTitle,
        movedPath,
        errorMessage,
        error,
        popupVisible,
        showError,
        renaming,
        checkboxes,
        handleConfirmButtonClick,
        handleCancelButtonClick,
        handleApply,
    } = useMoveObjectModal(props);

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
            options={<ObjectActionCheckboxes state={checkboxes} />}
            onConfirmButtonClick={handleConfirmButtonClick}
            onCancelButtonClick={handleCancelButtonClick}
            onApply={handleApply}
        />
    );
};

const mapStateToProps = (state: any) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(MoveObjectModal as any);
