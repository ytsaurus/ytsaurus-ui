import {DecommissionAction} from '../../../../../store/reducers/components/decommission';
import {DECOMMISSION_PARTIAL} from '../../../../../constants/components/main';
import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import {Toaster} from '@gravity-ui/uikit';
import {showErrorPopup} from '../../../../../utils/utils';
import type {NodeWithProps} from '../../../../../utils/components/nodes/tables';
import {NodesThunkAction, updateComponentsNode} from '../nodes';

type Node = NodeWithProps<'actions'>;

type DecommissionThunkAction = NodesThunkAction;

export function toggleNodeDecommissioned(node: Node): DecommissionThunkAction {
    return (dispatch) => {
        if (node.decommissioned) {
            dispatch(commissionNode(node.host));
        } else {
            dispatch(showDecommissionModal(node));
        }
    };
}

function showDecommissionModal(node: Node): DecommissionAction {
    const {host, decommissionedMessage: message} = node;
    return {type: DECOMMISSION_PARTIAL, data: {host, message}};
}

export function closeDecommissionModal(): DecommissionAction {
    return {type: DECOMMISSION_PARTIAL, data: {host: '', message: ''}};
}

function commissionNode(host: string): DecommissionThunkAction {
    return (dispatch) => {
        dispatch(decommissionNode({host, message: '', decommissioned: false}));
    };
}

export function decommissionNode({
    host,
    message,
    decommissioned,
}: {
    host: string;
    message: string;
    decommissioned: boolean;
}): DecommissionThunkAction {
    return (dispatch) => {
        return Promise.all([
            ytApiV3.set({path: '//sys/cluster_nodes/' + host + '/@decommissioned'}, decommissioned),
            ytApiV3.set(
                {
                    path: '//sys/cluster_nodes/' + host + '/@decommission_message',
                },
                message,
            ),
        ])
            .then(() => {
                dispatch(closeDecommissionModal());
                dispatch(updateComponentsNode(host));
            })
            .catch((e) => {
                const toaster = new Toaster();
                toaster.createToast({
                    name: 'decommissionNode_' + host,
                    type: 'error',
                    title: 'Failed',
                    allowAutoHiding: false,
                    content: `Failed to change decommissioned status of node ${host}`,
                    actions: [{label: ' Details', onClick: () => showErrorPopup(e)}],
                });
            });
    };
}
