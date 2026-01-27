import React from 'react';

import Link from '../../../../../components/Link/Link';
import {FlowTab} from '../../../../../store/reducers/flow/filters';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    getFlowCurrentComputation,
    getFlowPipelinePath,
} from '../../../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../../../utils/app-url';

export function FlowComputationPartitionFilter({
    partition,
    children,
    onClick,
}: {
    partition?: string;
    children: React.ReactNode;
    onClick: () => void;
}) {
    const path = useSelector(getFlowPipelinePath);
    const computation = useSelector(getFlowCurrentComputation);

    return !partition ? (
        children
    ) : (
        <Link
            url={makeFlowLink({
                path,
                tab: FlowTab.COMPUTATIONS,
                computation,
                partitionIdFilter: partition,
            })}
            onClick={onClick}
            routed
        >
            {children}
        </Link>
    );
}
