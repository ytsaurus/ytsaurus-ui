import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getProxies} from '../../../../../store/actions/components/proxies/proxies';
import {showErrorPopup} from '../../../../../utils/utils';

import {
    CHANGE_ROLE,
    CLOSE_CHANGE_ROLE_MODAL,
    OPEN_CHANGE_ROLE_MODAL,
} from '../../../../../constants/components/proxies/actions/change-role';
import {PROXY_TYPE} from '../../../../../constants/components/proxies/proxies';

export function openChangeRoleModal({host}) {
    return {
        type: OPEN_CHANGE_ROLE_MODAL,
        data: {host},
    };
}

export function closeChangeRoleModal() {
    return {
        type: CLOSE_CHANGE_ROLE_MODAL,
    };
}

export function changeRole(host, role, type) {
    return (dispatch) => {
        dispatch({type: CHANGE_ROLE.REQUEST});

        const basePath = type === PROXY_TYPE.HTTP ? '//sys/http_proxies' : '//sys/rpc_proxies';

        return yt.v3
            .set({path: `${basePath}/${host}/@role`}, role)
            .then(() => {
                dispatch({type: CLOSE_CHANGE_ROLE_MODAL});
                dispatch({type: CHANGE_ROLE.SUCCESS});
                dispatch(getProxies(type));
            })
            .catch((error) => {
                dispatch({type: CLOSE_CHANGE_ROLE_MODAL});
                dispatch({type: CHANGE_ROLE.FAILURE});
                showErrorPopup(error);
            });
    };
}
