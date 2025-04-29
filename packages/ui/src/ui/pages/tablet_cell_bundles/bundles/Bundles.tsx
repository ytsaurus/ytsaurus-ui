import React from 'react';
import {useDispatch} from 'react-redux';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import BundlesTable from '../../../pages/tablet_cell_bundles/bundles/BundlesTable.connected';
import BundlesTableInstruments from '../../../pages/tablet_cell_bundles/bundles/BundlesTableInstruments.connected';
import {
    copyHostListToClipboard,
    setTabletsActiveBundle,
} from '../../../store/actions/tablet_cell_bundles';

export default function Bundles() {
    const dispatch = useDispatch();

    const handleCopyHostListToClipboard = React.useCallback(
        (bundle: string) => {
            dispatch(copyHostListToClipboard(bundle));
        },
        [dispatch],
    );

    React.useEffect(() => {
        dispatch(setTabletsActiveBundle(''));
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
