import {createSelector} from 'reselect';

import {getSettingSystemNodesNodeType} from '../../../store/selectors/settings-ts';
import {NODE_TYPE} from '../../../../shared/constants/system';

export const getSystemNodesNodeTypesToLoad = createSelector(
    [getSettingSystemNodesNodeType],
    (nodeTypes) => {
        const valueSet = new Set(nodeTypes);
        if (valueSet.has(NODE_TYPE.ALL_NODES)) {
            return [NODE_TYPE.ALL_NODES];
        }

        return [...valueSet.values()];
    },
);
