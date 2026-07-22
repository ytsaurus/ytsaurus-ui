import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectActiveBundleProxies,
    selectActiveBundleProxiesSortState,
} from '../../../store/selectors/tablet_cell_bundles';
import {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import {type BundleInstance} from '../../../store/reducers/tablet_cell_bundles';
import {type OrderType} from '../../../utils/sort-helpers';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {CellsBundleController} from '../cells/CellsBundleController';

export const BundleProxiesTab = () => {
    const dispatch = useDispatch();

    const items = useSelector(selectActiveBundleProxies);
    const sortState = useSelector(selectActiveBundleProxiesSortState);

    const onSortChange = (column: keyof BundleInstance, order: OrderType) => {
        dispatch(setTabletsPartial({proxiesSort: {column, order}}));
    };

    return (
        <ErrorBoundary>
            <CellsBundleController
                items={items}
                hideColumns={['tablet_static_memory']}
                sortState={sortState}
                onSortChange={onSortChange}
            />
        </ErrorBoundary>
    );
};
