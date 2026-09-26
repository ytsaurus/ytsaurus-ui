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
};

export function makeFlowStatusMock(
    initial: GetPipelineStateData,
    {transitions = {}, failingActions = [], holdActions = false}: FlowStatusMockOptions = {},
) {
    let state = initial;
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
            state = transitions[action] ?? state;
            return Response.json({});
        });

    return {
        handlers: [
            http.get('*/api/v4/get_pipeline_state', () => Response.json(state)),
            actionHandler('start'),
            actionHandler('pause'),
            actionHandler('stop'),
            http.put('*/api/v4/flow_execute', () => Response.json({messages: []})),
        ],
        calls,
        releaseActions: () => releaseActions(),
    };
}

export function makeFlowStatusHandlers(initial: GetPipelineStateData) {
    return makeFlowStatusMock(initial).handlers;
}
