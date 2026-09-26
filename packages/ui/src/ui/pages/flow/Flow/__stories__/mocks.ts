import {http} from 'msw';

import {type GetPipelineStateData} from '../../../../../shared/yt-types';
import {type FlowStateAction} from '../../../../store/reducers/flow/status';

export const PIPELINE_PATH = '//home/test/flow';

type FlowStatusMockOptions = {
    // The state the pipeline reports once the action request is answered.
    transitions?: Partial<Record<FlowStateAction, GetPipelineStateData>>;
    failingActions?: Array<FlowStateAction>;
    // Action requests are answered only after #releaseActions() is called.
    holdActions?: boolean;
    // `target_state` of the dynamic spec, by default the one leading to |initial|.
    targetState?: FlowTargetState;
};

// The dynamic spec keeps enums in snake case.
type FlowTargetState = 'completed' | 'stopped' | 'paused';

const ACTION_TARGET_STATE: Record<FlowStateAction, FlowTargetState> = {
    start: 'completed',
    stop: 'stopped',
    pause: 'paused',
};

const DEFAULT_TARGET_STATE: Partial<Record<GetPipelineStateData, FlowTargetState>> = {
    Working: 'completed',
    Completed: 'completed',
    Draining: 'stopped',
    Stopped: 'stopped',
    Pausing: 'paused',
    Paused: 'paused',
};

export function makeFlowStatusMock(
    initial: GetPipelineStateData,
    {
        transitions = {},
        failingActions = [],
        holdActions = false,
        targetState = DEFAULT_TARGET_STATE[initial],
    }: FlowStatusMockOptions = {},
) {
    let state = initial;
    let target = targetState;
    const calls: Array<FlowStateAction> = [];
    let releaseActions = () => {};
    const actionsReleased = holdActions
        ? new Promise<void>((resolve) => {
              releaseActions = resolve;
          })
        : Promise.resolve();

    const actionHandler = (action: FlowStateAction) =>
        http.post(`*/api/v4/${action}_pipeline`, async () => {
            calls.push(action);
            await actionsReleased;
            if (failingActions.includes(action)) {
                return Response.json(
                    {code: 1, message: 'Controller is unavailable'},
                    {status: 500},
                );
            }
            target = ACTION_TARGET_STATE[action];
            state = transitions[action] ?? state;
            return Response.json({});
        });

    return {
        handlers: [
            http.get('*/api/v4/get_pipeline_state', () => Response.json(state)),
            http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
                Response.json({spec: target, version: 1}),
            ),
            actionHandler('start'),
            actionHandler('pause'),
            actionHandler('stop'),
            http.put('*/api/v4/flow_execute', () => Response.json({messages: []})),
        ],
        calls,
        releaseActions: () => releaseActions(),
        setState: (newState: GetPipelineStateData) => {
            state = newState;
        },
    };
}

export function makeFlowStatusHandlers(initial: GetPipelineStateData) {
    return makeFlowStatusMock(initial).handlers;
}
