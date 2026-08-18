import React from 'react';

import {FlowStateSection} from './FlowStateSection/FlowStateSection';

export function FlowPipelineStateTab({pipeline_path}: {pipeline_path: string}) {
    return <FlowStateSection key={pipeline_path} pipeline_path={pipeline_path} />;
}
