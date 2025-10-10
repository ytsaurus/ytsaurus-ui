import {useSelector} from '../../../../../store/redux-hooks';
import React from 'react';

import NodeTabletSlots from '../../../../../pages/components/tabs/node/NodeTabletSlots/NodeTabletSlots';
import type {RootState} from '../../../../../store/reducers';
import {getSortedItems} from '../../../../../store/selectors/components/nodes/node-card';
import {nodeSelector} from '../../../../../store/selectors/components/node/node';

function NodeTabletSlotsTab(): ReturnType<React.VFC> {
    const {node} = useSelector(nodeSelector);
    const tabletSlots = useSelector((state: RootState) => node && getSortedItems(state, {node}));

    if (!(node && tabletSlots.length > 0)) {
        return null;
    }

    return <NodeTabletSlots tabletSlots={tabletSlots} />;
}

export default React.memo(NodeTabletSlotsTab);
