import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../store/redux-hooks';

import isEmpty_ from 'lodash/isEmpty';

import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import {NoContent} from '../../../../../components/NoContent';
import i18n from './i18n';
import {type RootState} from '../../../../../store/reducers';
import {
    selectPool,
    selectPools,
    selectSchedulingIsRoot,
    selectTree,
} from '../../../../../store/selectors/scheduling/scheduling';
import {PoolAclPanel} from '../../../../../containers/ACL';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {type LoadingStatus} from '../../../../../constants';
import {selectAclLoadState} from '../../../../../store/selectors/acl/acl';
import {IdmObjectType} from '../../../../../constants/acl';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';

function PoolAcl() {
    const isRoot = useSelector(selectSchedulingIsRoot);

    const pool = useSelector(selectPool);
    const tree = useSelector(selectTree);
    const pools = useSelector(selectPools);

    if (isRoot) {
        return (
            <NoContent
                warning={i18n('alert_root-not-supported')}
                hint={i18n('context_select-pool')}
            />
        );
    }

    return isEmpty_(pools) ? null : (
        <ErrorBoundary>
            <PoolAclPanel key={`${tree}_${pool}`} path={pool} poolTree={tree} />
        </ErrorBoundary>
    );
}

function PoolAclWithRum({loadState}: {loadState: LoadingStatus}) {
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

const mapStateToProps = (state: RootState) => {
    return {
        loadState: selectAclLoadState(state, IdmObjectType.POOL),
    };
};

export default connect(mapStateToProps)(PoolAclWithRum);
