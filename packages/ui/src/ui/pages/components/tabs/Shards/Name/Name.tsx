import {connect} from 'react-redux';

import {
    closeNameEditor,
    openNameEditor,
    setShardName,
} from '../../../../../store/actions/components/shards';
import {type RootState} from '../../../../../store/reducers';

import {NameBase} from './NameBase';

const mapStateToProps = (state: RootState) => {
    const {nameId, nameVisible, nameLoading, nameLoaded, nameError, nameErrorData} =
        state.components.shards;

    return {
        loading: nameLoading,
        loaded: nameLoaded,
        error: nameError,
        errorData: nameErrorData,
        visible: nameVisible,
        editId: nameId,
    };
};

const mapDispatchToProps = {
    setShardName,
    openNameEditor,
    closeNameEditor,
};

export const Name = connect(mapStateToProps, mapDispatchToProps)(NameBase);
