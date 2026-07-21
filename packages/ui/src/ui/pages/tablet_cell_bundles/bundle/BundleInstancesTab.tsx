import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectActiveBundleInstances,
    selectActiveBundleInstancesSortState,
} from '../../../store/selectors/tablet_cell_bundles';
import {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import {type BundleInstance} from '../../../store/reducers/tablet_cell_bundles';
import {type OrderType} from '../../../utils/sort-helpers';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {CellsBundleController} from '../cells/CellsBundleController';

export const BundleInstancesTab = () => {
    const dispatch = useDispatch();

    const items = useSelector(selectActiveBundleInstances);
    const sortState = useSelector(selectActiveBundleInstancesSortState);

    const onSortChange = (column: keyof BundleInstance, order: OrderType) => {
        dispatch(setTabletsPartial({instancesSort: {column, order}}));
    };

    return (
        <ErrorBoundary>
            <CellsBundleController
                items={items}
                sortState={sortState}
                onSortChange={onSortChange}
            />
        </ErrorBoundary>
    );
};
