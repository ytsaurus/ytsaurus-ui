import React, {Fragment, useEffect} from 'react';
import b from 'bem-cn-lite';
import unipika from '../../../../common/thor/unipika';
import {useDispatch, useSelector} from 'react-redux';
import {Loader} from '@gravity-ui/uikit';

import Yson from '../../../../components/Yson/Yson';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YTErrorBlock} from '../../../../components/Block/Block';

import {
    getAttributesPath,
    getAttributesWithTypes,
    getLoadState,
} from '../../../../store/selectors/navigation';
import {
    getAttributesLoadingInfo,
    getAttributesTab,
} from '../../../../store/selectors/navigation/tabs/attributes';
import {requestAttributes} from '../../../../store/actions/navigation/tabs/attributes/attributes';

import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';

import {pathToFileName} from '../../helpers/pathToFileName';

import './Attributes.scss';

const block = b('yt-attributes');

function Attributes() {
    const dispatch = useDispatch();

    const attributes = useSelector(getAttributesTab);
    const attributesPath = useSelector(getAttributesPath);
    const {loading, loaded, error} = useSelector(getAttributesLoadingInfo);
    const ref = React.useRef(null);

    const settings = unipika.prepareSettings();

    useEffect(() => {
        dispatch(requestAttributes());
    }, [attributesPath]);

    const initialLoading = !loaded && loading;

    if (initialLoading) {
        return <Loader className={block({loading: initialLoading})} />;
    }
    console.log(ref);
    return (
        <Fragment>
            {error != undefined && <YTErrorBlock error={error} />}
            <Yson
                ref={ref}
                settings={settings}
                value={attributes}
                folding
                extraTools={
                    <YsonDownloadButton
                        value={attributes}
                        settings={settings}
                        name={`attributes_${pathToFileName(attributesPath)}`}
                    />
                }
            />
        </Fragment>
    );
}

export default function AttributesWithRum() {
    const loadState = useSelector(getLoadState);
    const attributes = useSelector(getAttributesWithTypes);

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
