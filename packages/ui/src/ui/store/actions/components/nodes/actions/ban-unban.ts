import {ThunkAction} from 'redux-thunk';

import {showErrorPopup, wrapApiPromiseByToaster} from '../../../../../utils/utils';
import format from '../../../../../common/hammer/format';
import {
    getNodes,
    isAllowedMaintenanceApi,
} from '../../../../../store/actions/components/nodes/nodes';
import {
    BAN_ITEM,
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    UNBAN_ITEM,
} from '../../../../../constants/components/ban-unban';
import {getCurrentUserName} from '../../../../selectors/global';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
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
    return (dispatch, getState) => {
        const allowMaintenanceApi = isAllowedMaintenanceApi(getState());
        const command = banned ? 'add_maintenance' : 'remove_maintenance';
        return allowMaintenanceApi
            ? wrapApiPromiseByToaster(
                  ytApiV3Id.executeBatch(YTApiId.addMaintenance, {
                      requests: [
                          {
                              command,
                              parameters: {
                                  component: 'cluster_node',
                                  type: 'ban',
                                  mine: true,
                                  address: host,
                                  comment: messageValue,
                              },
                          },
                      ],
                  }),
                  {
                      toasterName: 'add_maintenance',
                      isBatch: true,
                      skipSuccessToast: true,
                      errorTitle: `Failed to ${format.ReadableField(command).toLowerCase()}`,
                  },
              )
            : Promise.all([
                  ytApiV3.set({path: '//sys/cluster_nodes/' + host + '/@banned'}, banned),
                  ytApiV3.set(
                      {path: '//sys/cluster_nodes/' + host + '/@ban_message'},
                      messageValue,
                  ),
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
