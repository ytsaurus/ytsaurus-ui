import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import NodeMemoryDetailsTable from '../NodeMemoryDetailsTable/NodeMemoryDetailsTable';

import {
    setNodeBundlesSort,
    toggleNodeMemoryBundleExpanded,
} from '../../../../../store/actions/components/node/memory';
import {
    getNodeMemoryLoaded,
    getNodeMemoryLoading,
    getNodeMemorySortOrder,
    getNodeMemoryUsageBundlesItems,
} from '../../../../../store/selectors/components/node/memory';
import {SortState} from '../../../../../types';

function NodeBundles() {
    const dispatch = useDispatch();
    const loading = useSelector(getNodeMemoryLoading);
    const loaded = useSelector(getNodeMemoryLoaded);
    const items = useSelector(getNodeMemoryUsageBundlesItems);
    const sortOrder = useSelector(getNodeMemorySortOrder);

    const toggleExpandState = React.useCallback((item: (typeof items)[0]) => {
        dispatch(toggleNodeMemoryBundleExpanded(item.name));
    }, []);

    const handleSort = React.useCallback((order: SortState[]) => {
        dispatch(setNodeBundlesSort(order));
    }, []);

    return (
        <NodeMemoryDetailsTable
            loaded={loaded}
            loading={loading}
            items={items}
            onSort={handleSort}
            toggleExpand={toggleExpandState}
            nameColumnTitle={'Bundle / Cell'}
            sortState={sortOrder}
        />
    );
}

export default React.memo(NodeBundles);
