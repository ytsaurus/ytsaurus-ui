import React from 'react';

import {FlowStateSection} from './FlowStateSection/FlowStateSection';
import {useFlowStateUrlFilters} from './use-flow-state-url-filters';

export function FlowPipelineStateTab({pipeline_path}: {pipeline_path: string}) {
    const {restoredFilters, restoredUrlMalformed, restoreEpoch, onFiltersChange} =
        useFlowStateUrlFilters({});

    return (
        <FlowStateSection
            key={`${pipeline_path}:${restoreEpoch}`}
            pipeline_path={pipeline_path}
            restoredFilters={restoredFilters}
            restoredUrlMalformed={restoredUrlMalformed}
            onFiltersChange={onFiltersChange}
        />
    );
}
