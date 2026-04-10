import {type CSSProperties} from 'react';

import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import {Icon} from '@gravity-ui/uikit';

import type {MetaTableProps} from './MetaTable';

export type MetaTableStoryExampleKey =
    | 'basic'
    | 'withTitle'
    | 'customLabels'
    | 'grouped'
    | 'tooltipsAndHelp'
    | 'booleanValues'
    | 'hiddenRow'
    | 'rowGap'
    | 'withIcon';

export const metaTableStoryConfigs: Record<MetaTableStoryExampleKey, MetaTableProps> = {
    basic: {
        items: [
            {key: 'row_count', value: '1 024'},
            {key: 'uncompressed_data_size', value: '128 MiB'},
            {key: 'owner', value: 'root'},
        ],
    },
    withTitle: {
        title: 'Table attributes',
        items: [
            {key: 'type', value: 'table'},
            {key: 'revision', value: '42'},
        ],
    },
    customLabels: {
        items: [
            {key: 'internal_key', label: 'Display name', value: 'Value A'},
            {key: 'other', label: 'Notes', value: 'Arbitrary label override'},
        ],
    },
    grouped: {
        title: 'Metadata',
        items: [
            [
                {key: 'chunk_count', value: '42'},
                {key: 'tablet_count', value: '7'},
            ],
            [{key: 'erasure_codec', value: 'lrc_12_2_2'}],
        ],
        subTitles: ['Chunks', 'Storage'],
    },
    tooltipsAndHelp: {
        items: [
            {
                key: 'ttl',
                value: '86400',
                tooltip: 'Time to live in seconds',
            },
            {
                key: 'compression_codec',
                value: 'zstd',
                helpUrl: 'https://ytsaurus.tech/docs/en/user-guide/storage/compression',
            },
        ],
    },
    booleanValues: {
        items: [
            {key: 'sorted', value: true},
            {key: 'dynamic', value: false},
        ],
    },
    hiddenRow: {
        items: [
            {key: 'visible_metric', value: '100%'},
            {key: 'hidden_metric', value: 'n/a', visible: false},
        ],
    },
    rowGap: {
        rowGap: 4,
        alignItems: 'baseline',
        items: [
            {key: 'alpha', value: 'Short'},
            {key: 'beta', value: 'Longer value aligned on baseline'},
        ],
    },
    withIcon: {
        items: [
            {
                key: 'replicated',
                value: 'Yes',
                icon: <Icon data={CheckIcon} size={12} />,
            },
            {key: 'region', value: 'eu-west'},
        ],
    },
};

/** Stable order for Playwright screenshots (matches story `example` options). */
export const metaTableVisualCaseOrder: MetaTableStoryExampleKey[] = [
    'basic',
    'withTitle',
    'customLabels',
    'grouped',
    'tooltipsAndHelp',
    'booleanValues',
    'hiddenRow',
    'rowGap',
    'withIcon',
];

export const metaTableStoryFrameStyle: CSSProperties = {
    maxWidth: 520,
    padding: 12,
    border: '1px dashed var(--g-color-line-generic, #ddd)',
    borderRadius: 8,
};
