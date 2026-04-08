import type {Meta, StoryObj} from '@storybook/react';

import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {UnipikaValueType} from './YqlValue';
import {YqlValue} from './YqlValue';

type StoryUnipikaSettings = Omit<UnipikaSettings, 'validateSrcUrl' | 'normalizeUrl'>;

type DemoArgs = {
    type: UnipikaValueType;
    value: unknown;
    inline: boolean;
    settings: StoryUnipikaSettings;
};

const defaultSettings: StoryUnipikaSettings = {
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

const meta: Meta<DemoArgs> = {
    title: 'Components/YqlValue',
    component: YqlValue,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Renders a YQL value with Unipika. For `read_query_result` payloads, resolve the type from `yql_type_registry` using the type index stored in each cell, then pass the cell payload and that type into `YqlValue` (same idea as `ColumnCell`).',
            },
        },
    },
    args: {
        type: ['DataType', 'String'],
        value: 'hello',
        inline: false,
        settings: defaultSettings,
    },
    argTypes: {
        type: {
            control: 'object',
            description: 'YQL type tuple from `yql_type_registry`, e.g. ["DataType","String"]',
        },
        value: {
            control: 'object',
            description:
                'First element of the cell `rows[i][column][0]`: string, number, or nested array (e.g. `["19523"]` for Date in read_query_result).',
        },
        inline: {control: 'boolean'},
        settings: {
            control: 'object',
            description: 'Unipika formatting options (no validateSrcUrl / normalizeUrl here).',
        },
    },
    render: ({type, value, inline, settings}: DemoArgs) => (
        <YqlValue value={value} type={type} settings={settings} inline={inline} />
    ),
};

export default meta;

type Story = StoryObj<DemoArgs>;

export const Default: Story = {};

export const FromReadQueryResult_SearchPhrase: Story = {
    name: 'From read_query_result (search phrase)',
    args: {
        value: 'sample search phrase movies 2013 watch online',
        type: ['DataType', 'String'],
    },
    parameters: {
        docs: {
            description: {
                story: 'Cell shape `["…", "8"]`: in a typical registry, index 8 maps to `DataType` + `String`.',
            },
        },
    },
};

export const FromReadQueryResult_Uint64: Story = {
    name: 'From read_query_result (Uint64)',
    args: {
        value: '45',
        type: ['DataType', 'Uint64'],
    },
    parameters: {
        docs: {
            description: {
                story: 'Numeric column example: payload is often a string from the API; type is `Uint64` from `yql_type_registry[11]` in the sample registry.',
            },
        },
    },
};

export const FromReadQueryResult_LongText: Story = {
    name: 'From read_query_result (long text)',
    args: {
        value: 'Long placeholder text for wrapping and Unipika markup: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        type: ['DataType', 'String'],
    },
    parameters: {
        docs: {
            description: {
                story: 'Long string cell to exercise line breaks and Unipika HTML output.',
            },
        },
    },
};

const optionalDate: UnipikaValueType = ['OptionalType', ['DataType', 'Date']];
const optionalDatetime: UnipikaValueType = ['OptionalType', ['DataType', 'Datetime']];
const optionalInterval: UnipikaValueType = ['OptionalType', ['DataType', 'Interval']];
const optionalTimestamp: UnipikaValueType = ['OptionalType', ['DataType', 'Timestamp']];

export const FromReadQueryResult_Date: Story = {
    name: 'From read_query_result (Date)',
    args: {
        value: ['19523'],
        type: optionalDate,
    },
    parameters: {
        docs: {
            description: {
                story: 'Optional Date: day count in a single-element array, as returned by read_query_result.',
            },
        },
    },
};

export const FromReadQueryResult_Datetime: Story = {
    name: 'From read_query_result (Datetime)',
    args: {
        value: ['1686839400'],
        type: optionalDatetime,
    },
    parameters: {
        docs: {
            description: {
                story: 'Optional Datetime: Unix seconds in a one-element array; type from `yql_type_registry[9]`.',
            },
        },
    },
};

export const FromReadQueryResult_Interval: Story = {
    name: 'From read_query_result (Interval)',
    args: {
        value: ['93784567890'],
        type: optionalInterval,
    },
    parameters: {
        docs: {
            description: {
                story: 'Optional Interval; type resolved from index `"10"`.',
            },
        },
    },
};

export const FromReadQueryResult_Timestamp: Story = {
    name: 'From read_query_result (Timestamp)',
    args: {
        value: ['1686839400123456'],
        type: optionalTimestamp,
    },
    parameters: {
        docs: {
            description: {
                story: 'Optional Timestamp: integer microseconds in a one-element array; type from `yql_type_registry[11]`.',
            },
        },
    },
};
