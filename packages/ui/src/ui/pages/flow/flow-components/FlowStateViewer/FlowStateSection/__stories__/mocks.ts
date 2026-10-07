import {http} from 'msw';
import type {
    FlowDeleteStatesBody,
    FlowReadStatesBody,
    FlowReadStatesResponse,
    FlowStaticSpec,
} from '../../../../../../../shared/yt-types';

export function stateResponse(name: string): FlowReadStatesResponse {
    return {
        key_states: [{computation_id: 'checkout', key: ['alice'], states: {[name]: {events: 7}}}],
    };
}

export function createStateReadHandlers(
    read: (
        body: FlowReadStatesBody,
        parameters: Record<string, unknown>,
    ) => Promise<FlowReadStatesResponse> = async (body) => stateResponse(body.name ?? '/initial'),
    options: {
        spec?: FlowStaticSpec;
        onDelete?: (body: FlowDeleteStatesBody, parameters: Record<string, unknown>) => void;
    } = {},
) {
    return [
        http.all('*/api/v4/get_pipeline_spec', () =>
            Response.json({
                spec: options.spec ?? {
                    computations: {
                        checkout: {group_by_schema: [{name: 'account', type: 'string'}]},
                    },
                },
            }),
        ),
        http.all('*/api/v4/get_pipeline_state', () => Response.json('Stopped')),
        http.all('*/api/v3/check_permission', () => Response.json({action: 'allow'})),
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const parameters = JSON.parse(
                request.headers.get('x-yt-parameters') ??
                    atob(request.headers.get('x-yt-parameters-0') ?? 'e30='),
            );
            if (parameters.flow_command === 'describe-pipeline') {
                return Response.json({computations: {checkout: {}}});
            }
            if (parameters.flow_command === 'describe-computation') {
                return Response.json({partitions: []});
            }
            if (parameters.flow_command === 'read-states') {
                return Response.json(
                    await read((await request.json()) as FlowReadStatesBody, parameters),
                );
            }
            if (parameters.flow_command === 'delete-states') {
                options.onDelete?.((await request.json()) as FlowDeleteStatesBody, parameters);
                return Response.json({committed: true, matched_states: {key_states: {total: 1}}});
            }
            return new Response(null, {status: 400});
        }),
    ];
}
