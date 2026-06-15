import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {
    selectOperationDetailsLoadingStatus,
    selectOperationId,
    selectOperationTypedAttributes,
} from '../../../../../store/selectors/operations/operation';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {selectYsonSettingsDisableDecode} from '../../../../../store/selectors/thor/unipika';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {YsonDownloadButton} from '../../../../../components/DownloadAttributesButton';

function useOperationAttributesRumMesures() {
    const loadState = useSelector(selectOperationDetailsLoadingStatus);

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
    const typedAttributes = useSelector(selectOperationTypedAttributes);
    const settings = useSelector(selectYsonSettingsDisableDecode);
    const id = useSelector(selectOperationId);

    useOperationAttributesRumMesures();

    return (
        <YsonWithScroll
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
        />
    );
}

export default React.memo(OperationAttributes);
