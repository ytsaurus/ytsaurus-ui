import {connect} from 'react-redux';
import {
    abortRequests,
    moveObject,
} from '../../../../../store/actions/navigation/modals/move-object';
import {closeEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {updatePath, updateView} from '../../../../../store/actions/navigation';
import {selectPath} from '../../../../../store/selectors/navigation';

import {MoveObjectModalBase} from './MoveObjectModalBase';

const mapStateToProps = (state) => {
    const {navigation} = state;
    const path = selectPath(state);
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

const MoveObjectModal = connect(mapStateToProps, mapDispatchToProps)(MoveObjectModalBase);

export default MoveObjectModal;
