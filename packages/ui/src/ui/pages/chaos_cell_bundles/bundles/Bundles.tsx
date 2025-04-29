import React from 'react';
import {useDispatch} from 'react-redux';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import BundlesTable from '../../../pages/chaos_cell_bundles/bundles/BundlesTable.connected';
import BundlesTableInstruments from '../../../pages/chaos_cell_bundles/bundles/BundlesTableInstruments.connected';
import {
    copyHostListToClipboard,
    setChaosActiveBundle,
} from '../../../store/actions/chaos_cell_bundles';

export default function ChaosCellBundles() {
    const dispatch = useDispatch();

    const handleCopyHostListToClipboard = React.useCallback(
        (bundle: string) => {
            dispatch(copyHostListToClipboard(bundle));
        },
        [dispatch],
    );

    React.useEffect(() => {
        dispatch(setChaosActiveBundle(''));
    }, [dispatch]);

    return (
        <ErrorBoundary>
            <WithStickyToolbar
                hideToolbarShadow
                toolbar={<BundlesTableInstruments />}
                content={<BundlesTable copyHostListToClipboard={handleCopyHostListToClipboard} />}
            />
        </ErrorBoundary>
    );
}
