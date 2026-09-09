import {connect} from 'react-redux';
import {
    abortRequests,
    copyObject,
} from '../../../../../store/actions/navigation/modals/copy-object';
import {
    closeEditingPopup,
    hideError,
} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updateView} from '../../../../../store/actions/navigation';

import {CopyObjectModalBase} from './CopyObjectModalBase';

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
    hideError,
};

const CopyObjectModal = connect(mapStateToProps, mapDispatchToProps)(CopyObjectModalBase);

export default CopyObjectModal;
