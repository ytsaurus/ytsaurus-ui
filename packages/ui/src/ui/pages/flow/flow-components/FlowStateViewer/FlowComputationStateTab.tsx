import React from 'react';
import {useLocation} from 'react-router';

import {type FlowComputationMonitorProps} from '../../../../UIFactory';

import FlowStateSection from './FlowStateSection/FlowStateSection';
import {parseHeavyHitterStateSeed} from './helpers';

function FlowComputationStateTab({path, computation}: FlowComputationMonitorProps) {
    const {search} = useLocation();
    const initialFilters = React.useMemo(
        () => parseHeavyHitterStateSeed(new URLSearchParams(search).get('heavyHitterSeed')),
        [search],
    );

    return (
        <FlowStateSection
            key={`${path}:${computation}:${search}`}
            pipeline_path={path}
            fixedComputationId={computation}
            initialFilters={initialFilters}
        />
    );
}

export default FlowComputationStateTab;
