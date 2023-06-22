import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {showErrorPopup} from '../../../../../utils/utils';
import {getProxies} from '../../../../../store/actions/components/proxies/proxies';
import {PROXY_TYPE} from '../../../../../constants/components/proxies/proxies';
import {
    BAN_ITEM,
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    UNBAN_ITEM,
} from '../../../../../constants/components/ban-unban';
import {getCurrentUserName} from '../../../../../store/selectors/global';

function setAttributes({host, banned, messageValue, successType, closeType, failType}, type) {
    const basePath = type === PROXY_TYPE.HTTP ? '//sys/proxies' : '//sys/rpc_proxies';

    return (dispatch) => {
        return Promise.all([
            yt.v3.set({path: `${basePath}/${host}/@banned`}, banned),
            yt.v3.set({path: `${basePath}/${host}/@ban_message`}, messageValue),
        ])
            .then(() => {
                dispatch(getProxies(type));
                dispatch({type: successType});
                dispatch({type: closeType});
            })
            .catch((error) => {
                dispatch({type: closeType});
                dispatch({type: failType});
                showErrorPopup(error);
            });
    };
}

export function banProxy({host, message}, type) {
    return (dispatch, getState) => {
        const userName = getCurrentUserName(getState());
        const banMessage = `${userName}@: ${message}`;

        dispatch({type: BAN_ITEM.REQUEST});

        const data = {
            host,
            banned: true,
            messageValue: banMessage,
            successType: BAN_ITEM.SUCCESS,
            closeType: CLOSE_BAN_MODAL,
            failType: BAN_ITEM.FAILURE,
        };

        return dispatch(setAttributes(data, type));
    };
}

export function unbanProxy(host, type) {
    return (dispatch) => {
        dispatch({type: UNBAN_ITEM.REQUEST});

        const data = {
            host,
            banned: false,
            messageValue: '',
            successType: UNBAN_ITEM.SUCCESS,
            closeType: CLOSE_UNBAN_MODAL,
            failType: UNBAN_ITEM.FAILURE,
        };

        return dispatch(setAttributes(data, type));
    };
}
