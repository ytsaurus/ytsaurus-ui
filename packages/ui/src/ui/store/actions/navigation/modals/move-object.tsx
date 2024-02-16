import React from 'react';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import { Toaster } from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';

import { MOVE_OBJECT } from '../../../../constants/navigation/modals/move-object';
import { showErrorInModal } from '../../../../store/actions/navigation/modals/path-editing-popup';
import { HIDE_ERROR } from '../../../../constants/navigation/modals/path-editing-popup';
import { prepareDestinationPath, preparePath } from '../../../../utils/navigation';
import CancelHelper from '../../../../utils/cancel-helper';
import _ from 'lodash';
import { executeBatchWithRetries } from '../../execute-batch';
import { YTApiId } from '../../../../rum/rum-wrap-api';
import { rumLogError } from '../../../../rum/rum-counter';
import { wrapBatchPromise } from '../../../../utils/utils';
import { Dispatch } from 'redux';

const requests = new CancelHelper();
const toaster = new Toaster();

interface MoveOptions {
    preserve_account?: boolean;
}

function moveObjectIntoDirectory(from: string, to: string, { preserve_account }: MoveOptions, force: boolean) {
    const parts = from.split('/');
    const name = parts[parts.length - 1];
    return yt.v3.move({
        parameters: {
            source_path: preparePath(from),
            destination_path: prepareDestinationPath(to, name),
            preserve_account,
            force,
        },
        cancellation: requests.saveCancelToken,
    });
}

function moveObjectWithRename(from: string, to: string, { preserve_account }: MoveOptions) {
    return yt.v3.move({
        parameters: {
            source_path: preparePath(from),
            destination_path: to,
            preserve_account,
        },
        cancellation: requests.saveCancelToken,
    });
}

function moveSingleObject(from: string, to: string, options: MoveOptions, force: boolean): Promise<string> {
    const lastChar = to.charAt(to.length - 1);

    if (lastChar === '/') {
        return moveObjectIntoDirectory(from, to, options, force);
    }

    return yt.v3
        .exists({ parameters: { path: `${to}&` }, cancellation: requests.saveCancelToken })
        .then((exist: boolean) => {
            return exist
                ? moveObjectIntoDirectory(from, to, options, force)
                : moveObjectWithRename(from, to, options);
        });
}

function moveObjects(
    items: Array<{ path: string; titleUnquoted: string }>,
    to: string,
    { preserve_account }: MoveOptions,
    force: boolean
) {
    if (items.length === 1) {
        const [{ path }] = items;
        return moveSingleObject(path, to, { preserve_account }, force);
    }

    return yt.v3.startTransaction({}).then((id: string) => {
        const moveRequests = _.map(items, (node) => {
            return {
                command: 'move' as const,
                parameters: {
                    transaction_id: id,
                    source_path: preparePath(node.path),
                    destination_path: prepareDestinationPath(to, node.titleUnquoted),
                    preserve_account,
                },
            };
        });

        return wrapBatchPromise(
            executeBatchWithRetries(YTApiId.navigationMove, moveRequests, {
                errorTitle: 'Failed to move the object(s)',
                saveCancelSourceCb: requests.saveCancelToken,
            }),
            'Failed to move the object(s)',
        )
            .then(() => yt.v3.commitTransaction({ transaction_id: id }))
            .catch((err) =>
                yt.v3.abortTransaction({ transaction_id: id }).then(() => Promise.reject(err)),
            );
    });
}

function resolveEntityPath(entityId: string): Promise<string> {
    try {
        return yt.v3.get({
            path: `#${entityId}/@path`,
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        });
    } catch (e) {
        rumLogError(e as Error);
    }
    return Promise.resolve('');
}

export function moveObject(
    objectPath: string,
    movedPath: string,
    onSuccess: (destFullPath: string) => void,
    multipleMode: boolean,
    items: Array<{ path: string; titleUnquoted: string }>,
    { preserve_account }: MoveOptions,
    force: boolean
) {
    return (dispatch: Dispatch) => {
        dispatch({ type: MOVE_OBJECT.REQUEST });

        return Promise.resolve()
            .then(() =>
                multipleMode
                    ? moveObjects(items, movedPath, { preserve_account }, force).then(() => movedPath)
                    : moveSingleObject(objectPath, movedPath, { preserve_account }, force).then((value) =>
                        resolveEntityPath(JSON.parse(value)),
                    ),
            )
            .then((result) => {
                dispatch({ type: MOVE_OBJECT.SUCCESS });

                if (typeof onSuccess === 'function') {
                    onSuccess(result);
                }

                toaster.add({
                    name: 'move',
                    autoHiding: 10000,
                    type: 'success',
                    title: `Object${multipleMode ? 's' : ''} was successfully moved`,
                    content: <Link url={`navigation?path=${result}`}>{result}</Link>,
                });
                return result;
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({
                        type: MOVE_OBJECT.CANCELLED,
                    });
                } else {
                    dispatch({ type: MOVE_OBJECT.FAILURE });

                    const action = showErrorInModal(error);

                    dispatch(action);
                }
                return Promise.reject(error);
            });
    };
}

export function abortRequests() {
    return (dispatch: Dispatch) => {
        requests.removeAllRequests();

        dispatch({ type: HIDE_ERROR });
    };
}
