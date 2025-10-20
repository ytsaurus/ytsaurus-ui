import {useSelector} from 'react-redux';

import UIFactory from '../../../../../../UIFactory';
import {getClusterUiConfig} from '../../../../../../store/selectors/global/cluster';
import type {PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';

export function PoolAbc({pool}: {pool: PoolTreeNode}) {
    const clusterUiConfig = useSelector(getClusterUiConfig);

    return UIFactory.renderSchedulingTableItemExtraControls({
        pool,
        clusterUiConfig,
    });
}
