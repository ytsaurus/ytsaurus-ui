import {ThunkAction} from 'redux-thunk';

import {showErrorPopup} from '../../../../../utils/utils';
import {getNodes} from '../../../../../store/actions/components/nodes/nodes';
import {
    BAN_ITEM,
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    UNBAN_ITEM,
} from '../../../../../constants/components/ban-unban';
import {getCurrentUserName} from '../../../../selectors/global';
import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import {RootState} from '../../../../../store/reducers';

type BanUnbanThunkAction<T = any> = ThunkAction<T, RootState, unknown, any>;

function setAttributes({
    host,
    banned,
    messageValue,
    successType,
    closeType,
    failType,
}: {
    host: string;
    banned: boolean;
    messageValue?: string;
    successType: string;
    failType: string;
    closeType: string;
}): BanUnbanThunkAction<void> {
    return (dispatch) => {
        return Promise.all([
            ytApiV3.set({path: '//sys/cluster_nodes/' + host + '/@banned'}, banned),
            ytApiV3.set({path: '//sys/cluster_nodes/' + host + '/@ban_message'}, messageValue),
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

export function banNode({host, message}: {host: string; message: string}): BanUnbanThunkAction {
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

export function unbanNode(host: string): BanUnbanThunkAction {
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
