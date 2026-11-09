import {type ThunkAction} from 'redux-thunk';

import {type FlowExecuteTypes} from '../../../../shared/yt-types';

import {type YTError, type YTErrorRaw} from '../../../../@types/types';
import {ytApiV4} from '../../../rum/rum-wrap-api';
import ypath from '../../../common/thor/ypath';
import {type RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {decodeDynamicSpecText} from '../../../utils/flow/dynamic-spec';
import {forEachYTError} from '../../../utils/errors';
import {
    type FlowDynamicSpecView,
    type FlowSpecState,
    dynamicSpecActions,
    staticSpecActions,
} from '../../../store/reducers/flow/specs';
import {
    selectFlowDynamicSpecPath,
    selectFlowDynamicSpecSupportedFeatures,
    selectFlowDynamicSpecView,
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

export function loadFlowDynamicSpec(
    pipeline_path: string,
    view: FlowDynamicSpecView = 'effective',
): AsyncAction {
    return async (dispatch) => {
        const requestId = ++specRequestId;
        const isCurrentRequest = () => requestId === specRequestId;
        const parameters = {pipeline_path, output_format: 'web_json' as const};
        dispatch(dynamicSpecActions.onRequest({pipeline_path, view}));
        try {
            let supported_features: string[] = [];
            try {
                supported_features = await ytApiV4.flowExecute<'get-supported-features'>({
                    parameters: {...parameters, flow_command: 'get-supported-features'},
                    data: {},
                    cancellation: cancelHelper.removeAllAndSave,
                });
            } catch (error: unknown) {
                if (!isCurrentRequest() || isCancelled(error)) return;
                let unsupported = false;
                forEachYTError([error as YTErrorRaw], (inner) => {
                    const message = ypath.getValue(inner.message);
                    if (
                        typeof message === 'string' &&
                        /^No such command: get-supported-features[.,]/.test(message)
                    ) {
                        unsupported = true;
                    }
                });
                if (!unsupported) throw error;
            }
            if (!isCurrentRequest()) return;
            if (!supported_features.includes('dynamic_spec_patches')) {
                const data = await ytApiV4.getPipelineDynamicSpec({
                    parameters,
                    cancellation: cancelHelper.removeAllAndSave,
                });
                if (isCurrentRequest()) {
                    dispatch(dynamicSpecActions.onSuccess({data, supported_features}));
                }
                return;
            }
            const data =
                view === 'patches'
                    ? await ytApiV4.flowExecute<'get-pipeline-dynamic-spec-patches'>({
                          parameters: {
                              ...parameters,
                              flow_command: 'get-pipeline-dynamic-spec-patches',
                          },
                          data: {},
                          cancellation: cancelHelper.removeAllAndSave,
                      })
                    : await ytApiV4.flowExecute<'get-pipeline-dynamic-spec'>({
                          parameters: {...parameters, flow_command: 'get-pipeline-dynamic-spec'},
                          data: {view},
                          cancellation: cancelHelper.removeAllAndSave,
                      });
            if (!isCurrentRequest()) return;
            dispatch(
                dynamicSpecActions.onSuccess({
                    supported_features,
                    data: {
                        version: data.version,
                        spec: 'spec' in data ? data.spec : undefined,
                        ...('patches' in data
                            ? {
                                  patches: data.patches.map((patch) => ({
                                      ...patch,
                                      comment:
                                          patch.comment === undefined
                                              ? undefined
                                              : decodeDynamicSpecText(patch.comment),
                                  })),
                              }
                            : {}),
                    },
                }),
            );
        } catch (error: unknown) {
            if (isCurrentRequest() && !isCancelled(error)) {
                dispatch(dynamicSpecActions.onError({error: error as YTError}));
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

export function loadFlowDynamicSpecForEdit(
    path: string,
): AsyncAction<Promise<NonNullable<FlowSpecState['data']>>> {
    return async (_dispatch, getState) => {
        if (selectFlowDynamicSpecSupportedFeatures(getState())?.includes('dynamic_spec_patches')) {
            return ytApiV4.flowExecute<'get-pipeline-dynamic-spec'>({
                parameters: {
                    pipeline_path: path,
                    output_format: 'web_json',
                    flow_command: 'get-pipeline-dynamic-spec',
                },
                data: {view: 'base'},
            });
        }
        return ytApiV4.getPipelineDynamicSpec({
            parameters: {pipeline_path: path, output_format: 'web_json'},
        });
    };
}

export type DynamicSpecMutationCommand =
    'cancel-pipeline-dynamic-spec-patch' | 'reset-pipeline-dynamic-spec';

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
                    expected_version: {
                        $type: 'int64',
                        $value: String(ypath.getValue(body.expected_version)),
                    },
                    ...('patch' in body && body.patch !== undefined
                        ? {patch: {$type: 'int64', $value: String(ypath.getValue(body.patch))}}
                        : {}),
                },
            });
        } finally {
            if (path === selectFlowDynamicSpecPath(getState())) {
                dispatch(loadFlowDynamicSpec(path, selectFlowDynamicSpecView(getState())));
            }
        }
    };
}
