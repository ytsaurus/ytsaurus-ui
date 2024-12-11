import React from 'react';
import unipika from '../../../../common/thor/unipika';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';

import Yson from '../../../../components/Yson/Yson';

import {
    getAttributesPath,
    getAttributesWithTypes,
    getLoadState,
} from '../../../../store/selectors/navigation';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {pathToFileName} from '../../helpers/pathToFileName';

function Attributes({attributes, settings, attributesPath}) {
    return (
        <Yson
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
    );
}

Attributes.propTypes = {
    attributes: PropTypes.object.isRequired,
    attributesPath: PropTypes.string.isRequired,
    settings: Yson.settingsProps.isRequired,
};

const mapStateToProps = (state) => ({
    attributes: getAttributesWithTypes(state),
    settings: unipika.prepareSettings(),
    attributesPath: getAttributesPath(state),
});

const AttributesConnected = connect(mapStateToProps)(Attributes);

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

    return <AttributesConnected />;
}
