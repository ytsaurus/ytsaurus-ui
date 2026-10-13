import {http} from 'msw';
import type {FlowDeleteStatesBody} from '../../../../../../../shared/yt-types';

export function createDeleteWorkflowHandlers({
    failSecond = false,
    beforeDelete,
    onDelete,
}: {
    failSecond?: boolean;
    beforeDelete?: () => Promise<void>;
    onDelete?: (body: FlowDeleteStatesBody, parameters: Record<string, unknown>) => void;
} = {}) {
    let attempt = 0;
    return [
        http.all('*/api/v4/get_pipeline_state', () => Response.json('Stopped')),
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const body = (await request.json()) as FlowDeleteStatesBody;
            const parameters = JSON.parse(
                request.headers.get('x-yt-parameters') ??
                    atob(request.headers.get('x-yt-parameters-0') ?? 'e30='),
            );
            onDelete?.(body, parameters);
            attempt += 1;
            await beforeDelete?.();
            return Response.json(
                failSecond && attempt === 2
                    ? {committed: false, errors: ['State is locked']}
                    : {committed: true, matched_states: {key_states: {total: 1}}},
            );
        }),
    ];
}
