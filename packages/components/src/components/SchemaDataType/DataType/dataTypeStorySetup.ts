import type {CSSProperties} from 'react';

import type {DataTypeProps} from './DataType';

/** Keys match Storybook `example` control; shared with Playwright visual tests. */
export type DataTypeStoryExampleKey =
    | 'simple'
    | 'optional'
    | 'optionalMulti'
    | 'tagged'
    | 'withParams'
    | 'tuple'
    | 'struct'
    | 'nestedList';

export const dataTypeStoryExamples: Record<DataTypeStoryExampleKey, DataTypeProps> = {
    simple: {name: 'String'},
    optional: {name: 'Int64', optional: true},
    optionalMulti: {name: 'Utf8', optional: true, optionalLevel: 3},
    tagged: {name: 'Json', tagged: true, tags: ['yson', 'meta']},
    withParams: {name: 'Decimal', params: [10, 2]},
    tuple: {
        name: 'Tuple',
        complex: true,
        type: [{name: 'String'}, {name: 'Bool'}, {name: 'Double'}],
    },
    struct: {
        name: 'Struct',
        complex: true,
        struct: [
            {key: 'id', type: {name: 'Int64'}},
            {key: 'payload', type: {name: 'Yson', optional: true}},
        ],
    },
    nestedList: {
        name: 'List',
        complex: true,
        type: [
            {
                name: 'Struct',
                complex: true,
                struct: [{key: 'ts', type: {name: 'Timestamp'}}],
            },
        ],
    },
};

/** Stable order for visual regression tests. */
export const dataTypeVisualStoryCaseOrder: DataTypeStoryExampleKey[] = [
    'simple',
    'optional',
    'optionalMulti',
    'tagged',
    'withParams',
    'tuple',
    'struct',
    'nestedList',
];

export const dataTypeStoryFrameStyle: CSSProperties = {
    minWidth: 320,
    minHeight: 56,
    padding: 12,
    border: '1px dashed var(--g-color-line-generic, #ddd)',
    borderRadius: 8,
};
