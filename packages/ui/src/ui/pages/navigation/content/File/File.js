import React from 'react';
import {connect} from 'react-redux';
import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {abortAndReset, loadFile} from '../../../../store/actions/navigation/content/file';
import {useSelector} from '../../../../store/redux-hooks';
import {selectAttributes, selectPath} from '../../../../store/selectors/navigation';
import {
    selectDownloadPath,
    selectIsEmpty,
    selectIsTooBig,
    selectNavigationFileLoadingStatus,
} from '../../../../store/selectors/navigation/content/file';
import {selectEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import './File.scss';

import {FileBase} from './FileBase';

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, file} = state.navigation.content.file;
    const {mediumList} = state.global;

    const downloadPath = selectDownloadPath(state);
    const attributes = selectAttributes(state);
    const isTooBig = selectIsTooBig(state);
    const isEmpty = selectIsEmpty(state);
    const path = selectPath(state);
    const mode = selectEffectiveMode(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        mediumList,
        attributes,
        path,
        mode,
        isEmpty,
        isTooBig,
        downloadPath,
        file,
    };
};
const mapDispatchToProps = {
    loadFile,
    abortAndReset,
};

const FileConnected = connect(mapStateToProps, mapDispatchToProps)(FileBase);

export default function FileWithRum() {
    useDisableMaxContentWidth();

    const fileLoadState = useSelector(selectNavigationFileLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_FILE,
        startDeps: [fileLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_FILE,
        stopDeps: [fileLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <FileConnected />;
}
