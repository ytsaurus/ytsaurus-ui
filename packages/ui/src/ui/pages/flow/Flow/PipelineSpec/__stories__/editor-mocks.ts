import {http} from 'msw';
export const PIPELINE_PATH = '//home/test/flow';
export const VERSION = '1923307469208162014';
export const version = {$type: 'int64' as const, $value: VERSION};
export const effective = {
    computations: {noop: {batch_duration: 1002, max_rows_per_batch: 2000}},
    job_manager: {resource_limits: {user_slots: 2}},
    target_state: 'working',
};
export function requestParameters(request: Request) {
    const encoded = [...request.headers.entries()]
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
        .join('');
    return JSON.parse(
        request.headers.get('x-yt-parameters') ?? Buffer.from(encoded, 'base64').toString('utf8'),
    );
}
export function dynamicSpecEditorHandler() {
    return http.put('*/api/v4/flow_execute', ({request}) => {
        const {flow_command} = requestParameters(request);
        if (flow_command === 'get-pipeline-dynamic-spec-patches') {
            return Response.json({version, patches: []});
        }
        return Response.json({version, spec: effective});
    });
}
