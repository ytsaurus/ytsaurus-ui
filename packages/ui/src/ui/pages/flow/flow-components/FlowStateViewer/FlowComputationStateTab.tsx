import React from 'react';

import {type FlowComputationMonitorProps} from '../../../../UIFactory';

import {FlowStateSection} from './FlowStateSection/FlowStateSection';

export function FlowComputationStateTab({path, computation}: FlowComputationMonitorProps) {
    return (
        <FlowStateSection
            key={`${path}:${computation}`}
            pipeline_path={path}
            fixedComputationId={computation}
        />
    );
}
