import React from 'react';
import cn from 'bem-cn-lite';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';

import {main} from '../../../../components/MetaTable/presets';
import MetaTable from '../../../../components/MetaTable/MetaTable';

import {getAttributesWithTypes, getLoadState} from '../../../../store/selectors/navigation';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';

const block = cn('navigation-link');

function Link({attributes}) {
    const [targetPath, broken] = ypath.getValues(attributes, ['/target_path', '/broken']);

    return (
        <div className={block()}>
            <MetaTable
                items={[
                    main(attributes),
                    [
                        {key: 'target_path', value: targetPath},
                        {key: 'broken', value: broken},
                    ],
                ]}
            />
        </div>
    );
}

Link.propTypes = {
    // from connect
    attributes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    const attributes = getAttributesWithTypes(state);

    return {attributes};
};

const LinkConnected = connect(mapStateToProps)(Link);

export default function LinkWithRum() {
    const loadState = useSelector(getLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_LINK,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_LINK,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <LinkConnected />;
}
