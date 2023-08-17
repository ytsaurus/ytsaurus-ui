import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {
    LinkToModalAction,
    LinkToState,
} from '../../../../store/reducers/navigation/modals/link-to-modal';
import {RootState} from '../../../../store/reducers';
import {LINK_TO_MODAL_PARTIAL} from '../../../../constants/navigation/modals';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {Toaster} from '@gravity-ui/uikit';
import {getCluster} from '../../../../store/selectors/global';
import Link from '../../../../components/Link/Link';

type LinkToModalThunkAction<R = any> = ThunkAction<R, RootState, unknown, LinkToModalAction>;

export function showLinkToModal(
    params: {path?: string; target?: string} = {},
): LinkToModalThunkAction {
    return (dispatch) => {
        const {path, target} = params;
        dispatch({
            type: LINK_TO_MODAL_PARTIAL,
            data: {path, target, visible: true},
        });
    };
}

export function hideLinkToModal(): LinkToModalThunkAction {
    return (dispatch) => {
        dispatch({
            type: LINK_TO_MODAL_PARTIAL,
            data: {visible: false, linkPath: undefined, dstPath: undefined},
        });
    };
}

export function createLink(params: Pick<LinkToState, 'path' | 'target'>): LinkToModalThunkAction {
    return (dispatch, getState) => {
        const {target, path} = params;
        const cluster = getCluster(getState());

        return ytApiV3
            .create({
                path,
                type: 'link',
                attributes: {target_path: target},
            })
            .then(() => {
                dispatch(hideLinkToModal());
                const toast = new Toaster();
                toast.add({
                    name: 'create-link',
                    type: 'success',
                    title: 'Link created',
                    content: <Link url={`/${cluster}/navigation?path=${path}`}>{path}</Link>,
                });
            });
    };
}
