import React from 'react';
import {connect, useSelector} from 'react-redux';
import _ from 'lodash';

import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../components/NoContent/NoContent';
import {
    getIsRoot,
    getPool,
    getPools,
    getTree,
} from '../../../../../store/selectors/scheduling/scheduling';
import {PoolAclPanel} from '../../../../../components/ACL/ACL-connect-helpers';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {getAclLoadState} from '../../../../../store/selectors/acl';
import {IdmObjectType} from '../../../../../constants/acl';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';

function PoolAcl() {
    const isRoot = useSelector(getIsRoot);

    const pool = useSelector(getPool);
    const tree = useSelector(getTree);
    const pools = useSelector(getPools);

    if (isRoot) {
        return (
            <NoContent
                warning="Visualization is not supported for <Root>."
                hint=" Please select a specific pool."
            />
        );
    }

    return _.isEmpty(pools) ? null : (
        <ErrorBoundary>
            <PoolAclPanel path={pool} poolTree={tree} />
        </ErrorBoundary>
    );
}

function PoolAclWithRum({loadState}) {
    useAppRumMeasureStart({
        type: RumMeasureTypes.SCHEDULING_ACL,
        additionalStartType: RumMeasureTypes.SCHEDULING,
        startDeps: [loadState],
        allowStart: ([loadState]) => !isFinalLoadingStatus(loadState),
    });

    useRumMeasureStop({
        type: RumMeasureTypes.SCHEDULING_ACL,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <PoolAcl />;
}

const mapStateToProps = (state) => {
    return {
        loadState: getAclLoadState(state, IdmObjectType.POOL),
    };
};

export default connect(mapStateToProps)(PoolAclWithRum);
