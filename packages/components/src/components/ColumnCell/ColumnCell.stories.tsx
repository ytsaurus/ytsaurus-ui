import type {ComponentProps} from 'react';
import type {Decorator, Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import {YtComponentsConfigProvider} from '../../context';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {TypeArray} from '../SchemaDataType/dataTypes';
import {ColumnCell} from './ColumnCell';

type StoryUnipikaSettings = Omit<UnipikaSettings, 'validateSrcUrl' | 'normalizeUrl'>;

type ColumnCellStoryArgs = {
    className?: string;
    value: unknown;
    yqlTypes: TypeArray[] | null;
    ysonSettings: StoryUnipikaSettings;
    allowRawStrings: boolean | null;
    rowIndex: number;
    columnName: string;
    useYqlTypes?: boolean;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void | Promise<void>;
};

const defaultYsonSettings: StoryUnipikaSettings = {
    format: 'yson',
    showDecoded: false,
    compact: true,
    escapeWhitespace: false,
    binaryAsHex: true,
    asHTML: true,
    treatValAsData: true,
    indent: 4,
    break: true,
    escapeYQLStrings: true,
    nonBreakingIndent: true,
};

const meta = {
    title: 'Components/ColumnCell',
    component: ColumnCell,
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
        ((Story) => (
            <YtComponentsConfigProvider logError={() => undefined} unipika={defaultYsonSettings}>
                <div
                    style={{
                        minWidth: 280,
                        minHeight: 56,
                        padding: 12,
                        border: '1px dashed var(--g-color-line-generic, #ddd)',
                        borderRadius: 8,
                    }}
                >
                    <Story />
                </div>
            </YtComponentsConfigProvider>
        )) as Decorator<ColumnCellStoryArgs>,
    ],
    args: {
        columnName: 'sample_column',
        rowIndex: 0,
        allowRawStrings: false,
        useYqlTypes: true,
        ysonSettings: defaultYsonSettings,
        yqlTypes: [['DataType', 'String']] as TypeArray[],
        /** YQL row: `[value, indexIntoYqlTypes]`. Use a string, not `["text"]`, for String type (see YqlValue). */
        value: ['hello', 0] as unknown,
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

type Story = StoryObj<ColumnCellStoryArgs>;

export const Default: Story = {};

export const YqlInt64: Story = {
    args: {
        value: [42, 0] as unknown,
        yqlTypes: [['DataType', 'Int64']] as TypeArray[],
    },
};

export const YsonNumber: Story = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        value: 42,
    },
};

export const IncompleteYson: Story = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        value: {$incomplete: true, $value: 'Truncated…'},
    },
};

export const RawString: Story = {
    args: {
        yqlTypes: null,
        useYqlTypes: false,
        allowRawStrings: true,
        value: {$type: 'string', $value: '"hello"'},
    },
};
