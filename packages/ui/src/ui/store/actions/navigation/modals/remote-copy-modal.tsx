import React from 'react';
import {ThunkAction} from 'redux-thunk';
import _ from 'lodash';

import {RootState} from '../../../../store/reducers';
import {RemoteCopyModalStateAction} from '../../../../store/reducers/navigation/modals/remote-copy-modal';
import {REMOTE_COPY_MODAL_PARTIAL} from '../../../../constants/navigation/modals';
import {RemoteCopyParams} from '../../../../../@types/types';
import axios from 'axios';
import {Toaster} from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {showErrorPopup, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTError} from '../../../../types';
import {WithAttrs} from '../../../../utils/cypress-attributes';

type RemoteCopyThunkAction = ThunkAction<any, RootState, any, RemoteCopyModalStateAction>;

export function showRemoteCopyModal(paths: Array<string>): RemoteCopyThunkAction {
    return (dispatch) => {
        const requests = _.map(paths, (path) => {
            return {
                command: 'get' as const,
                parameters: {
                    path,
                    attributes: ['compression_codec', 'erasure_codec'],
                },
            };
        });

        return wrapApiPromiseByToaster(
            ytApiV3.executeBatch<WithAttrs<{compression_codec?: string; erasure_codec?: string}>>({
                requests,
            }),
            {
                toasterName: 'remoteCopyAttributes',
                skipSuccessToast: true,
                errorContent(e: YTError) {
                    return (
                        <span>
                            Failed to load attributes
                            <Link onClick={() => showErrorPopup(e)}>Details</Link>
                        </span>
                    );
                },
                errorTitle: 'Failed to load attributes',
                isBatch: true,
            },
        )
            .then((results) => {
                const attributesMap = _.reduce(
                    paths,
                    (acc, path, index) => {
                        acc[path] = results[index]?.output?.$attributes;
                        return acc;
                    },
                    {} as Record<string, unknown>,
                );
                dispatch({
                    type: REMOTE_COPY_MODAL_PARTIAL,
                    data: {paths, showModal: true, error: undefined, attributesMap},
                });
            })
            .catch((error) => {
                dispatch({type: REMOTE_COPY_MODAL_PARTIAL, data: {paths, showModal: true, error}});
            });
    };
}

export function hideRemoteCopyModal(): RemoteCopyThunkAction {
    return (dispatch) => {
        dispatch({type: REMOTE_COPY_MODAL_PARTIAL, data: {showModal: false}});
    };
}

export function remoteCopy(params: RemoteCopyParams): RemoteCopyThunkAction {
    return (dispatch) => {
        return axios.post<string>('/api/remote-copy', params).then(({data: id}) => {
            dispatch(hideRemoteCopyModal());
            const {dstCluster} = params;

            const toaster = new Toaster();
            toaster.createToast({
                type: 'success',
                name: 'remoteCopyStarted',
                timeout: 500000,
                title: 'Remote copy',
                content: (
                    <span>
                        <Link url={`/${dstCluster}/operations/${id}`}>{id}</Link> operation started
                    </span>
                ),
            });
        });
    };
}
