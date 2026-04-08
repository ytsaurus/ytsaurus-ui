import type {Meta, StoryObj} from '@storybook/react';

import {DataType} from './DataType';
import type {DataTypeProps} from './DataType';

type DemoArgs = {
    example:
        | 'simple'
        | 'optional'
        | 'optionalMulti'
        | 'tagged'
        | 'withParams'
        | 'tuple'
        | 'struct'
        | 'nestedList';
};

const examples: Record<DemoArgs['example'], DataTypeProps> = {
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

const meta: Meta<DemoArgs> = {
    title: 'Components/DataType',
    component: DataType,
    tags: ['autodocs'],
    args: {
        example: 'struct',
    },
    argTypes: {
        example: {
            control: 'select',
            options: [
                'simple',
                'optional',
                'optionalMulti',
                'tagged',
                'withParams',
                'tuple',
                'struct',
                'nestedList',
            ],
            description:
                'Sample shapes: primitive, optional, tags, type parameters, tuple, struct, nested complex.',
        },
    },
    parameters: {
        layout: 'padded',
    },
    render: ({example}: DemoArgs) => <DataType {...examples[example]} />,
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
