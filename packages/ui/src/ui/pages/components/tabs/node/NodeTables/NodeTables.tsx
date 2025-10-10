import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {
    getNodeMemoryLoaded,
    getNodeMemoryLoading,
    getNodeMemoryUsageTablesItemsSorted,
    getNodeMemoryUsageTablesSortOrder,
} from '../../../../../store/selectors/components/node/memory';
import NodeMemoryDetailsTable from '../NodeMemoryDetailsTable/NodeMemoryDetailsTable';
import {
    setNodeMemoryTablesSort,
    toggleNodeMemoryBundleExpanded,
} from '../../../../../store/actions/components/node/memory';
import {SortState} from '../../../../../types';

function NodeTables() {
    const dispatch = useDispatch();
    const loading = useSelector(getNodeMemoryLoading);
    const loaded = useSelector(getNodeMemoryLoaded);
    const items = useSelector(getNodeMemoryUsageTablesItemsSorted);
    const sortOrder = useSelector(getNodeMemoryUsageTablesSortOrder);

    const handleSort = React.useCallback((sortOrder: Array<SortState>) => {
        dispatch(setNodeMemoryTablesSort(sortOrder));
    }, []);

    const toggleExpandState = React.useCallback((item: (typeof items)[0]) => {
        dispatch(toggleNodeMemoryBundleExpanded(item.name));
    }, []);

    return (
        <NodeMemoryDetailsTable
            items={items}
            loaded={loaded}
            loading={loading}
            toggleExpand={toggleExpandState}
            onSort={handleSort}
            nameColumnTitle={'Bundles / Table'}
            sortState={sortOrder}
        />
    );
}

export default React.memo(NodeTables);
