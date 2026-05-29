import {createSelector} from 'reselect';

import {getSettingSystemNodesNodeType} from '../../../store/selectors/settings/settings-ts';
import {NODE_TYPE} from '../../../../shared/constants/system';

export const selectSystemNodesNodeTypesToLoad = createSelector(
    [getSettingSystemNodesNodeType],
    (nodeTypes) => {
        const valueSet = new Set(nodeTypes);
        if (valueSet.has(NODE_TYPE.ALL_NODES)) {
            return [NODE_TYPE.ALL_NODES];
        }

        return [...valueSet.values()];
    },
);
