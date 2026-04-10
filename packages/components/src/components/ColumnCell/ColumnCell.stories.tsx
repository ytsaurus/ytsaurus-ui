import type {ComponentProps} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import type {TypeArray} from '../SchemaDataType/dataTypes';
import {
    type ColumnCellStoryArgs,
    ColumnCellStoryDecorator,
    columnCellStoryBaseArgsForVisual,
} from './columnCellStorySetup';
import {ColumnCell} from './ColumnCell';

const meta = {
    title: 'Components/ColumnCell',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Table cell: YQL-typed values use `[payload, typeIndex]` with `yqlTypes[typeIndex]`; plain YSON uses `yqlTypes: null` or types without a matching index. Hover to show copy / truncated preview controls.',
            },
        },
    },
    decorators: [
        (Story) => (
            <ColumnCellStoryDecorator>
                <Story />
            </ColumnCellStoryDecorator>
        ),
    ],
    args: {
        ...columnCellStoryBaseArgsForVisual,
        onShowPreview: fn(),
    },
    argTypes: {
        value: {
            control: 'object',
            description:
                'YQL: `[payload, typeIndex]`. String payload must be a scalar string, not a one-element array (binary/base64).',
        },
        yqlTypes: {
            control: 'object',
            description: 'Per-column YQL type list; `null` forces YSON rendering only.',
        },
        ysonSettings: {control: 'object'},
        onShowPreview: {table: {disable: true}},
    },
    render: (args: ColumnCellStoryArgs) => (
        <ColumnCell {...(args as ComponentProps<typeof ColumnCell>)} />
    ),
} satisfies Meta<ColumnCellStoryArgs>;

export default meta;

type ColumnCellStory = StoryObj<typeof meta>;

export const Default: ColumnCellStory = {};

export const YqlInt64: ColumnCellStory = {
    args: {
        value: [42, 0] as unknown,
        yqlTypes: [['DataType', 'Int64']] as TypeArray[],
    },
};

export const YsonNumber: ColumnCellStory = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        value: 42,
    },
};

export const IncompleteYson: ColumnCellStory = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        value: {$incomplete: true, $value: 'Truncated…'},
    },
};

export const RawString: ColumnCellStory = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        allowRawStrings: true,
        value: {$type: 'string', $value: '"hello"'},
    },
};
