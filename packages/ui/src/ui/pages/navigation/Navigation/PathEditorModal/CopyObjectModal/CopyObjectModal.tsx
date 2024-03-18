import React, {FC} from 'react';
import {connect} from 'react-redux';

import PathEditorModal from '../PathEditorModal';

import {updateView} from '../../../../../store/actions/navigation';
import {
    abortRequests,
    copyObject,
} from '../../../../../store/actions/navigation/modals/copy-object';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {ObjectActionCheckboxes} from '../ObjectActionCheckboxes';
import {CopyObjectModalProps} from './types';
import {useCopyObjectModal} from './useCopyObjectModal';

const CopyObjectModal: FC<CopyObjectModalProps> = (props) => {
    const {
        title,
        description,
        placeholder,
        modalTitle,
        checkboxes,
        handleConfirmButtonClick,
        handleCancelButtonClick,
        handleApply,
    } = useCopyObjectModal(props);
    const {popupVisible, copying, copyPath, showError, errorMessage, error} = props;

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
            options={<ObjectActionCheckboxes state={checkboxes} />}
            errorMessage={errorMessage}
            onConfirmButtonClick={handleConfirmButtonClick}
            onCancelButtonClick={handleCancelButtonClick}
            onApply={handleApply}
        />
    );
};

const mapStateToProps = ({navigation}: {navigation: {modals: Record<string, any>}}) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(CopyObjectModal as any);
