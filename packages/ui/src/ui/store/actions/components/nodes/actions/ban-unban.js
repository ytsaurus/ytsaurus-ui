import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {showErrorPopup} from '../../../../../utils/utils';
import {getNodes} from '../../../../../store/actions/components/nodes/nodes';
import {
    BAN_ITEM,
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    UNBAN_ITEM,
} from '../../../../../constants/components/ban-unban';
import {getCurrentUserName} from '../../../../selectors/global';

function setAttributes({host, banned, messageValue, successType, closeType, failType}) {
    return (dispatch) => {
        return Promise.all([
            yt.v3.set({path: '//sys/cluster_nodes/' + host + '/@banned'}, banned),
            yt.v3.set({path: '//sys/cluster_nodes/' + host + '/@ban_message'}, messageValue),
        ])
            .then(() => {
                dispatch(getNodes());
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

export function banNode({host, message}) {
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

        return dispatch(setAttributes(data));
    };
}

export function unbanNode(host) {
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

        return dispatch(setAttributes(data));
    };
}
