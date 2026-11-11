import {http} from 'msw';
import {
    type FlowDynamicSpecBlame,
    type FlowDynamicSpecPatch,
    type Int64,
} from '../../../../../../shared/yt-types';

type FlowDynamicSpecSnapshot = {
    version: Int64;
    base_spec: unknown;
    effective_spec: unknown;
    patches: FlowDynamicSpecPatch[];
    blame?: FlowDynamicSpecBlame;
};

export const PIPELINE_PATH = '//home/test/flow';
export const VERSION = '1923307469208162014';
export const PATCH_ID = '1923189626042933625';
export const snapshot: FlowDynamicSpecSnapshot = {
    version: {$type: 'int64', $value: VERSION},
    base_spec: {computations: {noop: {batch_duration: 1000, max_rows_per_batch: 1000}}},
    effective_spec: {computations: {noop: {batch_duration: 1002, max_rows_per_batch: 2000}}},
    patches: [
        {
            patch_id: {$type: 'int64', $value: PATCH_ID},
            timestamp: '2026-11-02T15:55:23Z',
            comment: 'First patch',
            changes: [{path: '/computations/noop/batch_duration', value: 1001}],
        },
        {
            patch_id: {$type: 'int64', $value: VERSION},
            timestamp: '2026-11-02T15:56:23Z',
            comment: 'Second patch [YTFRONT-6091](https://st.yandex-team.ru/YTFRONT-6091)',
            changes: [
                {path: '/computations/noop/batch_duration', value: 1002},
                {path: '/computations/noop/max_rows_per_batch', value: 2000},
            ],
        },
    ],
};

export const largePatchSnapshot: FlowDynamicSpecSnapshot = {
    ...snapshot,
    patches: [
        {
            ...snapshot.patches[0],
            changes: [
                {
                    path: '/computations/noop/options',
                    value: Object.fromEntries(
                        Array.from({length: 24}, (_, index) => [
                            `option_${index}`,
                            index === 23 ? 'long_value_'.repeat(30) : index,
                        ]),
                    ),
                },
            ],
        },
        snapshot.patches[1],
    ],
};

export const blameSnapshot: FlowDynamicSpecSnapshot = {
    ...snapshot,
    base_spec: {
        computations: {
            noop: {
                batch_duration: 1000,
                max_rows_per_batch: 1000,
                options: {changed: 3, unchanged: 9},
            },
        },
    },
    effective_spec: {
        computations: {
            noop: {
                batch_duration: 1002,
                max_rows_per_batch: 2000,
                options: {changed: 4, unchanged: 9},
            },
        },
    },
    blame: Object.fromEntries(
        Object.entries({
            '/computations/noop/options/changed': snapshot.patches[0],
            '/computations/noop/batch_duration': snapshot.patches[1],
            '/computations/noop/max_rows_per_batch': snapshot.patches[1],
        }).map(([path, source]) => {
            const {patch_id, timestamp, comment} = source;
            return [path, {patch_id, timestamp, comment}];
        }),
    ),
    patches: [
        {...snapshot.patches[0], changes: [{path: '/computations/noop/options/changed', value: 4}]},
        snapshot.patches[1],
    ],
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

export function dynamicSpecHandler(
    state: FlowDynamicSpecSnapshot = snapshot,
    supportedFeatures = ['dynamic_spec_patches'],
) {
    return http.put('*/api/v4/flow_execute', async ({request}) => {
        const {flow_command} = requestParameters(request);
        if (flow_command === 'get-supported-features') return Response.json(supportedFeatures);
        if (flow_command === 'get-pipeline-dynamic-spec-patches') {
            return Response.json({version: state.version, patches: state.patches});
        }
        if (flow_command === 'get-pipeline-dynamic-spec') {
            const {view, blame} = (await request.json()) as {view: string; blame?: boolean};
            return Response.json({
                version: state.version,
                spec: view === 'base' ? state.base_spec : state.effective_spec,
                ...(blame && state.blame ? {blame: state.blame} : {}),
            });
        }
        return Response.json({version: state.version});
    });
}

export const markdownHandler = http.post('*/api/markdown-to-html', async ({request}) => {
    const {text} = (await request.json()) as {text: string};
    return Response.json({
        result: {
            html: text.startsWith('Second patch')
                ? '<p>Second patch <a href="https://st.yandex-team.ru/YTFRONT-6091">YTFRONT-6091</a></p>'
                : '<p>First patch</p>',
        },
    });
});

export const unsupportedHandler = http.put('*/api/v4/flow_execute', () =>
    Response.json(
        {
            code: 1,
            message: 'No such command: get-supported-features. Possible commands: []',
        },
        {status: 500},
    ),
);
export const legacyHandler = http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
    Response.json({spec: snapshot.effective_spec, version: snapshot.version}),
);
