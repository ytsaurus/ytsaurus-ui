import React from 'react';
import {getCluster} from '../../../../store/selectors/global/cluster';
import {NavigationError} from '../../../../pages/navigation/Navigation/NavigationError';
import {useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {YTError} from '../../../../types';

export function FlowError({error}: {error?: YTError}) {
    const path = useSelector(getFlowPipelinePath);
    const cluster = useSelector(getCluster);

    return !error ? null : (
        <NavigationError details={error} path={path} cluster={cluster} message={error.message} />
    );
}
