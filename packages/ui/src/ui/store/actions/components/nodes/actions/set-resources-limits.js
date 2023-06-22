import _ from 'lodash';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getNodes} from '../../../../../store/actions/components/nodes/nodes';
import {showErrorPopup} from '../../../../../utils/utils';
import {
    CLOSE_RESOURCES_MODAL,
    OPEN_RESOURCES_MODAL,
    SET_RESOURCES_LIMIT,
} from '../../../../../constants/components/nodes/actions/set-resources-limits';

export function openResourcesModal(node) {
    return {
        type: OPEN_RESOURCES_MODAL,
        data: {node},
    };
}

export function closeResourcesModal() {
    return {
        type: CLOSE_RESOURCES_MODAL,
    };
}

export function setResourcesLimit(newLimits, host) {
    return (dispatch) => {
        dispatch({type: SET_RESOURCES_LIMIT.REQUEST});

        const prepared = _.mapValues(newLimits, (limit) => limit.value);
        const resources = _.pickBy(prepared, (resource) => !isNaN(resource));

        return yt.v3
            .set(
                {
                    path: `//sys/cluster_nodes/${host}/@resource_limits_overrides`,
                },
                resources,
            )
            .then(() => {
                dispatch(getNodes());
                dispatch({type: SET_RESOURCES_LIMIT.SUCCESS});
                dispatch({type: CLOSE_RESOURCES_MODAL});
            })
            .catch((error) => {
                dispatch({type: CLOSE_RESOURCES_MODAL});
                dispatch({type: SET_RESOURCES_LIMIT.FAILURE});
                showErrorPopup(error);
            });
    };
}
