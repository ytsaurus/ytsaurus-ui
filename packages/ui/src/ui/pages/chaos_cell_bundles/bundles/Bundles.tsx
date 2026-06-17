import React from 'react';
import {useDispatch} from '../../../store/redux-hooks';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import BundlesTable from '../../../pages/chaos_cell_bundles/bundles/BundlesTable.connected';
import BundlesTableInstruments from '../../../pages/chaos_cell_bundles/bundles/BundlesTableInstruments.connected';
import {setChaosActiveBundle} from '../../../store/actions/chaos_cell_bundles';

export default function ChaosCellBundles() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setChaosActiveBundle(''));
    }, [dispatch]);

    return (
        <ErrorBoundary>
            <WithStickyToolbar
                hideToolbarShadow
                toolbar={<BundlesTableInstruments />}
                content={<BundlesTable />}
            />
        </ErrorBoundary>
    );
}
