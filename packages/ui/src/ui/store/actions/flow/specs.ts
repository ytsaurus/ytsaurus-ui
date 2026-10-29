import {type ThunkAction} from 'redux-thunk';

import {
    type FlowDynamicSpecBlame,
    type FlowDynamicSpecOverride,
    type FlowDynamicSpecPatch,
    type FlowDynamicSpecSnapshot,
    type FlowExecuteTypes,
} from '../../../../shared/yt-types';

import {type YTError, type YTErrorRaw} from '../../../../@types/types';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import unipika from '../../../common/thor/unipika';
import {type RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {forEachYTError} from '../../../utils/errors';
import {
    UnsafeDynamicSpecVersionError,
    decodeDynamicSpecAudit,
    dynamicSpecVersion,
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
        let unavailable = false;
        try {
            for (let attempt = 0; attempt < 3; ++attempt) {
                const patches = await ytApiV4.flowExecute<'get-pipeline-dynamic-spec-patches'>({
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
                const effective = await ytApiV4.flowExecute<'get-pipeline-dynamic-spec'>({
                    parameters: {
                        pipeline_path,
                        flow_command: 'get-pipeline-dynamic-spec',
                        output_format: 'web_json',
                    },
                    data: {view: 'effective', blame: true},
                    cancellation: cancelHelper.removeAllAndSave,
                });
                if (!isCurrentRequest()) {
                    return;
                }
                if (!effective.blame) {
                    unavailable = true;
                    break;
                }
                const base = await ytApiV4.flowExecute<'get-pipeline-dynamic-spec'>({
                    parameters: {
                        pipeline_path,
                        flow_command: 'get-pipeline-dynamic-spec',
                        output_format: 'web_json',
                    },
                    data: {view: 'base'},
                    cancellation: cancelHelper.removeAllAndSave,
                });
                if (!isCurrentRequest()) {
                    return;
                }
                const version = dynamicSpecVersion(effective.version);
                if (
                    version !== dynamicSpecVersion(base.version) ||
                    version !== dynamicSpecVersion(patches.version)
                ) {
                    continue;
                }
                const legacyBlame =
                    'operation' in effective.blame && typeof effective.blame.operation === 'string'
                        ? (effective.blame as FlowDynamicSpecOverride)
                        : undefined;
                const state: FlowDynamicSpecSnapshot = decodeDynamicSpecAudit({
                    version: effective.version,
                    effective_spec: effective.spec,
                    base_spec: base.spec,
                    override_spec: legacyBlame ?? {operation: 'inherit'},
                    ...(legacyBlame
                        ? {}
                        : {
                              blame: effective.blame as FlowDynamicSpecBlame,
                              patches: patches.patches.filter(
                                  (patch): patch is FlowDynamicSpecPatch => 'path' in patch,
                              ),
                          }),
                    runtime_target_state:
                        effective.spec !== null &&
                        typeof effective.spec === 'object' &&
                        'target_state' in effective.spec &&
                        typeof effective.spec.target_state === 'string'
                            ? effective.spec.target_state
                            : undefined,
                    audit: patches.patches.map(({patch_id, comment, timestamp}) => ({
                        version: patch_id,
                        comment,
                        timestamp,
                    })),
                });
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
                return;
            }
            if (!unavailable) {
                throw new Error(i18n('error_inconsistent-version'));
            }
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
            forEachYTError([error as YTErrorRaw], (inner) => {
                const message =
                    typeof inner.message === 'string' ? inner.message : inner.message?.$value;
                if (
                    typeof message === 'string' &&
                    (message.startsWith('No such command: get-pipeline-dynamic-spec.') ||
                        message.startsWith('No such command: get-pipeline-dynamic-spec-patches.'))
                ) {
                    unavailable = true;
                }
            });
            if (!unavailable) {
                dispatch(dynamicSpecActions.onError({error: error as YTError}));
                return;
            }
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
    };
}

export function updateFlowDynamicSpec({
    data,
    path,
    comment,
}: {
    data: FlowSpecState['data'];
    path: string;
    comment?: string;
}): AsyncAction<Promise<void>> {
    return async (dispatch) => {
        if (!data) {
            return;
        }
        dynamicSpecVersion(data.version);
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
    | 'patch-pipeline-dynamic-spec'
    | 'cancel-pipeline-dynamic-spec-patch'
    | 'reset-pipeline-dynamic-spec';

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
