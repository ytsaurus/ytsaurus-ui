import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {
    getNodesInfo,
    getSelectedNodes,
} from '../../../../../store/selectors/navigation/content/map-node';
import {CountsList} from '../../../../../components/CountsList/CountsList';

import MultipleActions from '../MultipleActions';

function NodesTypesContainer() {
    const nodesInfo = useSelector(getNodesInfo);
    const selectedNodes = useSelector(getSelectedNodes);

    return (
        <CountsList
            items={nodesInfo}
            selectedItems={selectedNodes}
            renderActions={() => <MultipleActions />}
        />
    );
}

export default React.memo(NodesTypesContainer);
