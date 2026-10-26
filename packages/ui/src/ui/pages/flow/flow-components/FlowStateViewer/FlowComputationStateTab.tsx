import React from 'react';

import {type FlowComputationMonitorProps} from '../../../../UIFactory';

import {FlowStateSection} from './FlowStateSection/FlowStateSection';
import {useFlowStateUrlFilters} from './use-flow-state-url-filters';

export function FlowComputationStateTab({path, computation}: FlowComputationMonitorProps) {
    const {restoredFilters, restoredUrlMalformed, heavyHitterSeed, restoreEpoch, onFiltersChange} =
        useFlowStateUrlFilters({fixedComputationId: computation});

    return (
        <FlowStateSection
            key={`${path}:${computation}:${restoreEpoch}`}
            pipeline_path={path}
            fixedComputationId={computation}
            initialFilters={heavyHitterSeed}
            restoredFilters={restoredFilters}
            restoredUrlMalformed={restoredUrlMalformed}
            onFiltersChange={onFiltersChange}
        />
    );
}
