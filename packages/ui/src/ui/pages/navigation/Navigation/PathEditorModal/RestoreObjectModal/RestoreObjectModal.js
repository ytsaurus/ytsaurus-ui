import {connect} from 'react-redux';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {restoreObject} from '../../../../../store/actions/navigation/modals/restore-object';
import {updateView} from '../../../../../store/actions/navigation';

import {RestoreObjectModalBase} from './RestoreObjectModalBase';

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

const RestoreObjectModal = connect(mapStateToProps, mapDispatchToProps)(RestoreObjectModalBase);

export default RestoreObjectModal;
