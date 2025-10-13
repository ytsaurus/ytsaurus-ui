import React from 'react';
import {useSelector} from 'react-redux';

import UIFactory from '../../../../../../UIFactory';
import {getCluster, getClusterUiConfig} from '../../../../../../store/selectors/global';
import type {PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';

export function PoolAbc({pool}: {pool: PoolTreeNode}) {
    const cluster = useSelector(getCluster);
    const clusterUiConfig = useSelector(getClusterUiConfig);

    return (
        <span>
            {UIFactory.renderSchedulingTableItemExtraControls({
                cluster,
                pool,
                clusterUiConfig,
            })}
        </span>
    );
}
