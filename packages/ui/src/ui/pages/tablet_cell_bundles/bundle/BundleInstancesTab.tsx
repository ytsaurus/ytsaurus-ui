import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {getActiveBundleInstances} from '../../../store/selectors/tablet_cell_bundles';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {CellsBundleController} from '../cells/CellsBundleController';

export const BundleInstancesTab = () => {
    const items = useSelector(getActiveBundleInstances);

    return (
        <ErrorBoundary>
            <CellsBundleController items={items} />
        </ErrorBoundary>
    );
};
