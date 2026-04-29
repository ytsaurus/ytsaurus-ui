import type {Meta, StoryObj} from '@storybook/react';

import {DataType} from './DataType';
import {type DataTypeStoryExampleKey, dataTypeStoryExamples} from './dataTypeStorySetup';

type DemoArgs = {
    example: DataTypeStoryExampleKey;
};

const meta: Meta<DemoArgs> = {
    title: 'Components/DataType',
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
    render: ({example}: DemoArgs) => <DataType {...dataTypeStoryExamples[example]} />,
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
