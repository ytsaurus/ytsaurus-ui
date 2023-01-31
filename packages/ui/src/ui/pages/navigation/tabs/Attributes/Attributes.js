import React from 'react';
import unipika from '../../../../common/thor/unipika';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';

import Yson from '../../../../components/Yson/Yson';

import {getAttributesWithTypes, getLoadState} from '../../../../store/selectors/navigation';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';

function Attributes({attributes, settings}) {
    return <Yson settings={settings} value={attributes} folding />;
}

Attributes.propTypes = {
    attributes: PropTypes.object.isRequired,
    settings: Yson.settingsProps.isRequired,
};

const mapStateToProps = (state) => ({
    attributes: getAttributesWithTypes(state),
    settings: unipika.prepareSettings(),
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
