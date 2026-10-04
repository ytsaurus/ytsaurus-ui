import {http} from 'msw';

import {type FlowDynamicSpecSnapshot} from '../../../../../../shared/yt-types';

export const PIPELINE_PATH = '//home/test/flow';
export const OWNER_VERSION = '1923189626042933625';
export const NEWER_VERSION = '1923307469208162014';
export const MAP_VERSION = '1923307469208162013';
const version = {$type: 'int64' as const, $value: OWNER_VERSION};
export const RAW_UNICODE_KEY = '\u00d0\u009a\u00d0\u00b2\u00d0\u00be\u00d1\u0082\u00d0\u00b0';
export const unicodeGroup = {
    changed: 1,
    label: '\u00d0\u009a\u00d0\u00b2\u00d0\u00be\u00d1\u0082\u00d0\u00b0 \u00f0\u009f\u0098\u008a',
    binary: '\xff',
    [RAW_UNICODE_KEY]: 3,
};
const newer = {$type: 'int64' as const, $value: NEWER_VERSION};
const mapVersion = {$type: 'int64' as const, $value: MAP_VERSION};
const typedCpu = {$type: 'int64', $value: '2'};
const ownedCounter = {$type: 'uint64', $value: '18446744073709551615'};
export const demoMap = {limit: {$type: 'double', $value: '1000'}, period: 1000};

export const dynamicSpecSnapshot: FlowDynamicSpecSnapshot = {
    version: newer,
    base_spec: {
        unicode_group: unicodeGroup,
        computations: {noop: {empty_batch_backoff: 250, max_rows_per_batch: 1001}},
        job_manager: {resource_limits: {cpu: 2, user_slots: 2, memory: 4096}},
        labels: ['release', 'stable'],
        target_state: 'stopped',
    },
    effective_spec: {
        throttlers: {
            ui_demo: {
                ...demoMap,
                rpc_timeout: 10000,
                classes: {},
                retrying_channel: {max_attempts: 100, total_timeout: 600000},
            },
        },
        unicode_group: unicodeGroup,
        computations: {noop: {empty_batch_backoff: 250, max_rows_per_batch: 1001}},
        job_manager: {resource_limits: {cpu: typedCpu, user_slots: 2}},
        owned_counter: ownedCounter,
        labels: ['release', 'pinned'],
        empty: {},
        target_state: 'completed',
    },
    override_spec: {
        operation: 'map',
        children: {
            throttlers: {
                operation: 'map',
                children: {
                    ui_demo: {
                        operation: 'map',
                        version: mapVersion,
                        value: {},
                        children: Object.fromEntries(
                            Object.entries(demoMap).map(([key, value]) => [
                                key,
                                {operation: 'set' as const, version: mapVersion, value},
                            ]),
                        ),
                    },
                },
            },
            unicode_group: {
                operation: 'map',
                version,
                value: {},
                children: Object.fromEntries(
                    Object.entries(unicodeGroup).map(([key, value]) => [
                        key,
                        {operation: 'set' as const, version, value},
                    ]),
                ),
            },
            job_manager: {
                operation: 'map',
                children: {
                    resource_limits: {
                        operation: 'map',
                        version,
                        value: {},
                        children: {
                            cpu: {operation: 'set', version: newer, value: typedCpu},
                            user_slots: {operation: 'inherit'},
                        },
                    },
                },
            },
            labels: {operation: 'set', version, value: ['release', 'pinned']},
            owned_counter: {operation: 'set', version: newer, value: ownedCounter},
            empty: {operation: 'map', version, value: {}},
            mask: {operation: 'map', version},
            missing: {operation: 'remove', version},
        },
    },
    audit: [
        {
            version: mapVersion,
            timestamp: '2026-10-05T17:01:04.000000Z',
            comment: 'Map demo: limit and period cancel together',
        },
        {
            version,
            timestamp: '2026-10-05T08:48:47.000000Z',
            comment:
                '\u00d0\u0094\u00d0\u00b5\u00d0\u00bc\u00d0\u00be override \u00d0\u00b4\u00d0\u00bb\u00d1\u008f \u00d0\u00bf\u00d1\u0080\u00d0\u00be\u00d0\u00b2\u00d0\u00b5\u00d1\u0080\u00d0\u00ba\u00d0\u00b8 \u00d0\u00b2\u00d0\u00ba\u00d0\u00bb\u00d0\u00b0\u00d0\u00b4\u00d0\u00ba\u00d0\u00b8 Dynamic Spec.',
        },
        {version: newer, timestamp: '2026-10-04T10:01:00.000001Z', comment: 'Новая CPU квота'},
    ],
    runtime_target_state: 'completed',
};

export const dynamicSpecHandler = http.put('*/api/v4/flow_execute', () =>
    Response.json(dynamicSpecSnapshot),
);

export const legacyDynamicSpecHandler = http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
    Response.json({spec: dynamicSpecSnapshot.effective_spec, version: newer}),
);

export const unavailableDynamicSpecHandler = http.put('*/api/v4/flow_execute', () =>
    Response.json(
        {
            code: 1,
            message: 'No such command: get-pipeline-dynamic-spec-state. Possible commands: []',
        },
        {status: 500},
    ),
);

export const failedDynamicSpecHandler = http.put('*/api/v4/flow_execute', () =>
    Response.json({code: 1, message: 'Access denied'}, {status: 500}),
);
