import {type ThunkAction} from 'redux-thunk';

import {type FlowExecuteTypes} from '../../../../shared/yt-types';
import {type YTError, type YTErrorRaw} from '../../../../@types/types';
import {forEachYTError} from '../../../utils/errors';
import unipika from '../../../common/thor/unipika';
import {UnsafeDynamicSpecVersionError, dynamicSpecVersion} from '../../../utils/flow/dynamic-spec';
import i18n from '../../../pages/flow/Flow/PipelineSpec/i18n';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {type RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {
    type FlowSpecState,
    dynamicSpecActions,
    staticSpecActions,
} from '../../../store/reducers/flow/specs';
import {
    selectFlowDynamicSpecPath,
    selectFlowStaticSpecPath,
} from '../../../store/selectors/flow/specs';

const cancelHelper = new CancelHelper();

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

export function loadFlowStaticSpec(pipeline_path: string): AsyncAction {
    return (dispatch) => {
        dispatch(staticSpecActions.onRequest({pipeline_path}));
        return ytApiV4
            .getPipelineSpec({
                parameters: {pipeline_path, output_format: 'web_json'},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data: FlowSpecState['data']) => {
                    dispatch(staticSpecActions.onSuccess({data}));
                },
                (error: any) => {
                    if (!isCancelled(error)) {
                        dispatch(staticSpecActions.onError({error}));
                    }
                },
            );
    };
}

export function updateFlowStaticSpec(
    {
        data,
        path,
    }: {
        data: FlowSpecState['data'];
        path: string;
    },
    {force}: {force?: boolean},
): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        return ytApiV4
            .setPipelineSpec(
                {pipeline_path: path, expected_version: data?.version, force},
                data?.spec,
            )
            .then(() => {
                const pipeline_path = selectFlowStaticSpecPath(getState());
                if (pipeline_path && pipeline_path === path) {
                    dispatch(loadFlowStaticSpec(path));
                }
            });
    };
}

let dynamicSpecRequestId = 0;

export function loadFlowDynamicSpec(pipeline_path: string): AsyncAction {
    return async (dispatch) => {
        const requestId = ++dynamicSpecRequestId;
        const isCurrentRequest = () => requestId === dynamicSpecRequestId;
        dispatch(dynamicSpecActions.onRequest({pipeline_path}));
        try {
            await ytApiV4.flowExecute<'get-pipeline-dynamic-spec-patches'>({
                parameters: {
                    pipeline_path,
                    flow_command: 'get-pipeline-dynamic-spec-patches',
                    output_format: 'web_json',
                },
                data: {},
                cancellation: cancelHelper.removeAllAndSave,
            });
            if (!isCurrentRequest()) {
                return;
            }
            const data = await ytApiV4.flowExecute<'get-pipeline-dynamic-spec'>({
                parameters: {
                    pipeline_path,
                    flow_command: 'get-pipeline-dynamic-spec',
                    output_format: 'web_json',
                },
                data: {view: 'effective'},
                cancellation: cancelHelper.removeAllAndSave,
            });
            dynamicSpecVersion(data.version);
            if (isCurrentRequest()) {
                dispatch(dynamicSpecActions.onSuccess({data}));
            }
        } catch (error: unknown) {
            if (!isCurrentRequest() || isCancelled(error)) {
                return;
            }
            let unavailable = false;
            forEachYTError([error as YTErrorRaw], (inner) => {
                const message =
                    typeof inner.message === 'string' ? inner.message : inner.message?.$value;
                if (
                    message?.startsWith('No such command: get-pipeline-dynamic-spec.') ||
                    message?.startsWith('No such command: get-pipeline-dynamic-spec-patches.')
                ) {
                    unavailable = true;
                }
            });
            if (!unavailable) {
                dispatch(
                    dynamicSpecActions.onError({
                        error:
                            error instanceof UnsafeDynamicSpecVersionError
                                ? {message: i18n('error_unsafe-version')}
                                : (error as YTError),
                    }),
                );
                return;
            }
            try {
                const data: FlowSpecState['data'] = await ytApiV4.getPipelineDynamicSpec({
                    parameters: {pipeline_path, output_format: 'web_json'},
                    cancellation: cancelHelper.removeAllAndSave,
                });
                if (isCurrentRequest()) {
                    dispatch(
                        dynamicSpecActions.onSuccess({
                            data: data && {...data, dynamic_spec_state_unavailable: true},
                        }),
                    );
                }
            } catch (fallbackError: unknown) {
                if (isCurrentRequest() && !isCancelled(fallbackError)) {
                    dispatch(dynamicSpecActions.onError({error: fallbackError as YTError}));
                }
            }
        }
    };
}

export function updateFlowDynamicSpec({
    data,
    path,
}: {
    data: FlowSpecState['data'];
    path: string;
}): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        return ytApiV4
            .setPipelineDynamicSpec(
                {pipeline_path: path, expected_version: data?.version},
                data?.spec,
            )
            .then(() => {
                const pipline_path = selectFlowDynamicSpecPath(getState());
                if (path === pipline_path) {
                    dispatch(loadFlowDynamicSpec(path));
                }
            });
    };
}

export type DynamicSpecMutationCommand = 'patch-pipeline-dynamic-spec';

export type DynamicSpecMutation = {
    [Command in DynamicSpecMutationCommand]: {
        path: string;
        command: Command;
        body: FlowExecuteTypes[Command]['BodyType']['body'];
    };
}[DynamicSpecMutationCommand];

export function mutateFlowDynamicSpec({
    path,
    command,
    body,
}: DynamicSpecMutation): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        dynamicSpecVersion(body.expected_version);
        if ('patch' in body && body.patch !== undefined) {
            dynamicSpecVersion(body.patch);
        }
        try {
            await ytApiV4.flowExecute<DynamicSpecMutationCommand>({
                parameters: {
                    pipeline_path: path,
                    flow_command: command,
                    input_format: {$value: 'json', $attributes: {encode_utf8: true}},
                    output_format: 'web_json',
                },
                data: {
                    ...body,
                    ...('comment' in body && body.comment
                        ? {comment: unipika.utils.utf8.encode(body.comment)}
                        : {}),
                    expected_version: {
                        $type: 'int64',
                        $value: dynamicSpecVersion(body.expected_version),
                    },
                    ...('patch' in body && body.patch !== undefined
                        ? {patch: {$type: 'int64', $value: dynamicSpecVersion(body.patch)}}
                        : {}),
                },
            });
        } finally {
            if (path === selectFlowDynamicSpecPath(getState())) {
                dispatch(loadFlowDynamicSpec(path));
            }
        }
    };
}
