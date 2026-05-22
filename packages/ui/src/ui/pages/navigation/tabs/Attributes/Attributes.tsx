import {Loader} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';
import React, {useEffect} from 'react';
import unipika from '../../../../common/thor/unipika';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import {YTErrorBlock} from '../../../../containers/Block/Block';

import {requestAttributes} from '../../../../store/actions/navigation/tabs/attributes/attributes';
import {
    selectAttributesPath,
    selectAttributesWithTypes,
    selectLoadState,
} from '../../../../store/selectors/navigation';
import {
    selectAttributesRequestState,
    selectAttributesTab,
} from '../../../../store/selectors/navigation/tabs/attributes';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import {pathToFileName} from '../../helpers/pathToFileName';
import {useRenderRowExtraTools} from './useRenderRowExtraTools';

import './Attributes.scss';

const block = b('yt-attributes');

function Attributes() {
    const dispatch = useDispatch();

    const attributes = useSelector(selectAttributesTab);
    const attributesPath = useSelector(selectAttributesPath);
    const {loading, error} = useSelector(selectAttributesRequestState);

    const settings = unipika.prepareSettings();

    const renderRowExtraTools = useRenderRowExtraTools();

    useEffect(() => {
        dispatch(requestAttributes());
    }, [dispatch, attributesPath]);

    if (loading) {
        return <Loader className={block({loading})} />;
    }

    return (
        <>
            {error && <YTErrorBlock error={error} />}

            <YsonWithScroll
                settings={settings}
                value={attributes}
                extraTools={
                    <YsonDownloadButton
                        value={attributes}
                        settings={settings}
                        name={`attributes_${pathToFileName(attributesPath)}`}
                    />
                }
                renderRowExtraTools={renderRowExtraTools}
            />
        </>
    );
}

export default function AttributesWithRum() {
    const loadState = useSelector(selectLoadState);
    const attributes = useSelector(selectAttributesWithTypes);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_ATTRIBUTES,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_ATTRIBUTES,
        stopDeps: [loadState, attributes],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <Attributes />;
}
