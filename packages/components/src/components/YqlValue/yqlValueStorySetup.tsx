import {type CSSProperties} from 'react';

import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {UnipikaValueType} from './YqlValue';

/** Same shape as stories; shared with Playwright visual tests (no Storybook imports). */
export type YqlValueStoryUnipikaSettings = Omit<UnipikaSettings, 'validateSrcUrl' | 'normalizeUrl'>;

export type YqlValueStoryArgs = {
    type: UnipikaValueType;
    value: unknown;
    inline: boolean;
    settings: YqlValueStoryUnipikaSettings;
};

export const defaultYqlValueStorySettings: YqlValueStoryUnipikaSettings = {
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

export const yqlValueStoryBaseArgs: YqlValueStoryArgs = {
    type: ['DataType', 'String'],
    value: 'hello',
    inline: false,
    settings: defaultYqlValueStorySettings,
};

export const yqlValueOptionalDate: UnipikaValueType = ['OptionalType', ['DataType', 'Date']];
export const yqlValueOptionalDatetime: UnipikaValueType = [
    'OptionalType',
    ['DataType', 'Datetime'],
];
export const yqlValueOptionalInterval: UnipikaValueType = [
    'OptionalType',
    ['DataType', 'Interval'],
];
export const yqlValueOptionalTimestamp: UnipikaValueType = [
    'OptionalType',
    ['DataType', 'Timestamp'],
];

export const yqlValueStoryFrameStyle: CSSProperties = {
    minWidth: 280,
    minHeight: 56,
    padding: 12,
    border: '1px dashed var(--g-color-line-generic, #ddd)',
    borderRadius: 8,
};

/** Story / screenshot cases: `args` merged over {@link yqlValueStoryBaseArgs}. */
export const yqlValueVisualStoryCases: Array<{
    testName: string;
    args: Partial<YqlValueStoryArgs>;
}> = [
    {testName: 'Default', args: {}},
    {
        testName: 'From read_query_result (search phrase)',
        args: {
            value: 'sample search phrase movies 2013 watch online',
            type: ['DataType', 'String'],
        },
    },
    {
        testName: 'From read_query_result (Uint64)',
        args: {
            value: '45',
            type: ['DataType', 'Uint64'],
        },
    },
    {
        testName: 'From read_query_result (long text)',
        args: {
            value: 'Long placeholder text for wrapping and Unipika markup: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
            type: ['DataType', 'String'],
        },
    },
    {
        testName: 'From read_query_result (Date)',
        args: {
            value: ['19523'],
            type: yqlValueOptionalDate,
        },
    },
    {
        testName: 'From read_query_result (Datetime)',
        args: {
            value: ['1686839400'],
            type: yqlValueOptionalDatetime,
        },
    },
    {
        testName: 'From read_query_result (Interval)',
        args: {
            value: ['93784567890'],
            type: yqlValueOptionalInterval,
        },
    },
    {
        testName: 'From read_query_result (Timestamp)',
        args: {
            value: ['1686839400123456'],
            type: yqlValueOptionalTimestamp,
        },
    },
];
