import React from 'react';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import CellsInstruments from '../../../pages/chaos_cell_bundles/cells/CellsInstruments.connected';
import CellsTable from '../../../pages/chaos_cell_bundles/cells/CellsTable.connected';

export function ChaosCells() {
    return (
        <ErrorBoundary>
            <WithStickyToolbar toolbar={<CellsInstruments />} content={<CellsTable />} />
        </ErrorBoundary>
    );
}
