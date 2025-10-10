import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {getActiveBundleProxies} from '../../../store/selectors/tablet_cell_bundles';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {CellsBundleController} from '../cells/CellsBundleController';

export const BundleProxiesTab = () => {
    const items = useSelector(getActiveBundleProxies);
    return (
        <ErrorBoundary>
            <CellsBundleController items={items} hideColumns={['tablet_static_memory']} />
        </ErrorBoundary>
    );
};
