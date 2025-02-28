import React, {FC} from 'react';
import Document from './Document';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {getNavigationDocumentLoadingStatus} from '../../../../store/selectors/navigation/content/document';
import {useSelector} from 'react-redux';
import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';

const DocumentWithRum: FC = () => {
    const loadState = useSelector(getNavigationDocumentLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_DOCUMENT,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_DOCUMENT,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    useDisableMaxContentWidth();

    return <Document />;
};

export default DocumentWithRum;
