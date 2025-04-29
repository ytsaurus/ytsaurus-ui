import React from 'react';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import CellsInstruments from '../../../pages/tablet_cell_bundles/cells/CellsInstruments.connected';
import CellsTable from '../../../pages/tablet_cell_bundles/cells/CellsTable.connected';

export function BundleCells() {
    return (
        <ErrorBoundary>
            <WithStickyToolbar
                hideToolbarShadow
                toolbar={<CellsInstruments />}
                content={<CellsTable />}
            />
        </ErrorBoundary>
    );
}
