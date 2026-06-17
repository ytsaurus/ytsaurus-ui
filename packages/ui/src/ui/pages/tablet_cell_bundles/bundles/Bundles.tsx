import React from 'react';
import {useDispatch} from '../../../store/redux-hooks';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import BundlesTable from '../../../pages/tablet_cell_bundles/bundles/BundlesTable.connected';
import BundlesTableInstruments from '../../../pages/tablet_cell_bundles/bundles/BundlesTableInstruments.connected';
import {setTabletsActiveBundle} from '../../../store/actions/tablet_cell_bundles';

export default function Bundles() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setTabletsActiveBundle(''));
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
