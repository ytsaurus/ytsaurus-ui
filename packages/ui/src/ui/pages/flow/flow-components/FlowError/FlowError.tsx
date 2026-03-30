import React from 'react';
import {selectCluster} from '../../../../store/selectors/global/cluster';
import {NavigationError} from '../../../../pages/navigation/Navigation/NavigationError';
import {useSelector} from '../../../../store/redux-hooks';
import {selectFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {YTError} from '../../../../types';

export function FlowError({error}: {error?: YTError}) {
    const path = useSelector(selectFlowPipelinePath);
    const cluster = useSelector(selectCluster);

    return !error ? null : (
        <NavigationError details={error} path={path} cluster={cluster} message={error.message} />
    );
}
