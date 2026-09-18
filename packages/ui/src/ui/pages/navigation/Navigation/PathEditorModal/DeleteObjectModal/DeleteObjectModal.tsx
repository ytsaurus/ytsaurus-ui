import {connect} from 'react-redux';
import {compose} from 'redux';

import {
    closeDeleteModal,
    deleteObject,
    deleteObjects,
    getRealPath,
    getRealPaths,
    togglePermanentlyDelete,
} from '../../../../../store/actions/navigation/modals/delete-object';
import withScope from '../../../../../hocs/components/Modal/withScope';
import {selectIsTrashPath} from '../../../../../store/selectors/navigation';

import './DeleteObjectModal.scss';
import {type RootState} from '../../../../../store/reducers';

import {DeleteObjectModalBase} from './DeleteObjectModalBase';

const mapStateToProps = (state: RootState) => {
    const {
        error,
        errorData,
        loading,
        visible,
        permanently,
        item,
        loadingRealPath,
        errorRealPath,
        errorDataRealPath,
        realPath,
        resourceUsage,
        multipleInfo,
        multipleMode,
    } = state.navigation.modals.deleteObject;
    const inTrash = selectIsTrashPath(state);

    return {
        error,
        errorData,
        visible,
        permanently,
        item,
        loading,
        loadingRealPath,
        errorRealPath,
        errorDataRealPath,
        realPath,
        multipleInfo,
        resourceUsage,
        multipleMode,
        inTrash,
    };
};

const mapDispatchToProps = {
    getRealPath,
    deleteObject,
    deleteObjects,
    getRealPaths,
    closeDeleteModal,
    togglePermanentlyDelete,
};

const DeleteObjectModal = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withScope('delete-object-modal'),
)(DeleteObjectModalBase);

export default DeleteObjectModal;
