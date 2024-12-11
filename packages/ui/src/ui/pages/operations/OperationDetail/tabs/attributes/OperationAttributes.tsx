import React from 'react';
import {useSelector} from 'react-redux';

import {
    getOperationDetailsLoadingStatus,
    getOperationId,
    getOperationTypedAttributes,
} from '../../../../../store/selectors/operations/operation';
import Yson from '../../../../../components/Yson/Yson';
import {getOperationAttributesYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {YsonDownloadButton} from '../../../../../components/DownloadAttributesButton';

function useOperationAttributesRumMesures() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_ATTRIBUTES,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_ATTRIBUTES,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });
}

function OperationAttributes({className}: {className: string}) {
    const typedAttributes = useSelector(getOperationTypedAttributes);
    const settings = useSelector(getOperationAttributesYsonSettings);
    const id = useSelector(getOperationId);

    useOperationAttributesRumMesures();

    return (
        <Yson
            className={className}
            value={typedAttributes}
            settings={settings}
            extraTools={
                <YsonDownloadButton
                    value={typedAttributes}
                    settings={settings}
                    name={`operation_attributes_${id}`}
                />
            }
            folding
        />
    );
}

export default React.memo(OperationAttributes);
