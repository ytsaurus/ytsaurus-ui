import {type ThunkAction} from 'redux-thunk';

import {type FlowExecuteTypes, type Int64} from '../../../../shared/yt-types';

import {type YTError, type YTErrorRaw} from '../../../../@types/types';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import unipika from '../../../common/thor/unipika';
import {type RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {forEachYTError} from '../../../utils/errors';
import {
    UnsafeDynamicSpecVersionError,
    decodeDynamicSpecAudit,
    dynamicSpecEdits,
    dynamicSpecPath,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
    validateDynamicSpecVersions,
} from '../../../utils/flow/dynamic-spec';
import i18n from '../../../pages/flow/Flow/PipelineSpec/i18n';
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
let specRequestId = 0;

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

export function loadFlowStaticSpec(pipeline_path: string): AsyncAction {
    return (dispatch) => {
        const requestId = ++specRequestId;
        const isCurrentRequest = () => requestId === specRequestId;
        dispatch(staticSpecActions.onRequest({pipeline_path}));
        return ytApiV4
            .getPipelineSpec({
                parameters: {pipeline_path, output_format: 'web_json'},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data: FlowSpecState['data']) => {
                    if (isCurrentRequest()) {
                        dispatch(staticSpecActions.onSuccess({data}));
                    }
                },
                (error: any) => {
                    if (isCurrentRequest() && !isCancelled(error)) {
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

export function loadFlowDynamicSpec(pipeline_path: string): AsyncAction {
    return async (dispatch) => {
        const requestId = ++specRequestId;
        const isCurrentRequest = () => requestId === specRequestId;
        dispatch(dynamicSpecActions.onRequest({pipeline_path}));
        try {
            const response = await ytApiV4.flowExecute<'get-pipeline-dynamic-spec-state'>({
                parameters: {
                    pipeline_path,
                    flow_command: 'get-pipeline-dynamic-spec-state',
                    output_format: 'web_json',
                },
                data: {},
                cancellation: cancelHelper.removeAllAndSave,
            });
            if (!isCurrentRequest()) {
                return;
            }
            const state = decodeDynamicSpecAudit(response);
            validateDynamicSpecVersions(state);
            dispatch(
                dynamicSpecActions.onSuccess({
                    data: {
                        spec: state.effective_spec,
                        version: state.version,
                        dynamic_spec_state: state,
                    },
                }),
            );
        } catch (error: unknown) {
            if (!isCurrentRequest() || isCancelled(error)) {
                return;
            }
            if (error instanceof UnsafeDynamicSpecVersionError) {
                dispatch(
                    dynamicSpecActions.onError({
                        error: {message: i18n('error_unsafe-version')},
                    }),
                );
                return;
            }
            let unavailable = false;
            forEachYTError([error as YTErrorRaw], (inner) => {
                const message =
                    typeof inner.message === 'string' ? inner.message : inner.message?.$value;
                if (
                    typeof message === 'string' &&
                    message.startsWith('No such command: get-pipeline-dynamic-spec-state.')
                ) {
                    unavailable = true;
                }
            });
            if (!unavailable) {
                dispatch(dynamicSpecActions.onError({error: error as YTError}));
                return;
            }
            if (!isCurrentRequest()) {
                return;
            }
            try {
                const data: FlowSpecState['data'] = await ytApiV4.getPipelineDynamicSpec({
                    parameters: {pipeline_path, output_format: 'web_json'},
                    cancellation: cancelHelper.removeAllAndSave,
                });
                if (!isCurrentRequest()) {
                    return;
                }
                if (data) {
                    dynamicSpecVersion(data.version);
                }
                dispatch(
                    dynamicSpecActions.onSuccess({
                        data: data && {...data, dynamic_spec_state_unavailable: true},
                    }),
                );
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
    originalSpec,
    comment,
}: {
    data: FlowSpecState['data'];
    path: string;
    originalSpec?: unknown;
    comment?: string;
}): AsyncAction<Promise<void>> {
    return async (dispatch) => {
        if (!data) {
            return;
        }
        dynamicSpecVersion(data.version);
        if (originalSpec !== undefined) {
            const edits = dynamicSpecEdits(
                originalSpec,
                encodeDynamicSpecValue(data.spec, originalSpec),
            );
            if (!edits.length) {
                return;
            }
            if (edits.length !== 1 || edits[0].value === undefined || !edits[0].path.length) {
                throw new Error(i18n('error_sparse-edit'));
            }
            return dispatch(
                mutateFlowDynamicSpec({
                    path,
                    command: 'set-pipeline-dynamic-spec',
                    body: {
                        path: dynamicSpecPath(edits[0].path),
                        spec: edits[0].value,
                        comment,
                        expected_version: data.version,
                    },
                }),
            );
        }
        return dispatch(
            mutateFlowDynamicSpec({
                path,
                command: 'set-pipeline-dynamic-spec',
                body: {
                    path: '',
                    spec: data.spec,
                    expected_version: data.version,
                    comment,
                },
            }),
        );
    };
}

export type DynamicSpecMutationCommand =
    | 'set-pipeline-dynamic-spec'
    | 'cancel-pipeline-dynamic-spec-patch'
    | 'cancel-pipeline-dynamic-spec-override'
    | 'reset-pipeline-dynamic-spec-override';

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
        if ('version' in body) {
            dynamicSpecVersion(body.version as Int64);
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
                    ...('version' in body
                        ? {version: {$type: 'int64', $value: dynamicSpecVersion(body.version)}}
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
