import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {
    selectNodesInfo,
    selectSelectedNodes,
} from '../../../../../store/selectors/navigation/content/map-node';
import {CountsList} from '../../../../../components/CountsList/CountsList';

import MultipleActions from '../Actions/MultipleActions/MultipleActions';

function NodesTypesContainer() {
    const nodesInfo = useSelector(selectNodesInfo);
    const selectedNodes = useSelector(selectSelectedNodes);

    return (
        <CountsList
            items={nodesInfo}
            selectedItems={selectedNodes}
            renderActions={() => <MultipleActions />}
        />
    );
}

export default React.memo(NodesTypesContainer);
