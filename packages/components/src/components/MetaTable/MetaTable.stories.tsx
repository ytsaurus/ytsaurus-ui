import type {Meta, StoryObj} from '@storybook/react';
import {Icon} from '@gravity-ui/uikit';
import {Check} from '@gravity-ui/icons';

import {MetaTable} from './MetaTable';
import type {MetaTableProps} from './MetaTable';

type DemoArgs = {
    example:
        | 'basic'
        | 'withTitle'
        | 'customLabels'
        | 'grouped'
        | 'tooltipsAndHelp'
        | 'booleanValues'
        | 'hiddenRow'
        | 'rowGap'
        | 'withIcon';
};

const configs: Record<DemoArgs['example'], MetaTableProps> = {
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
                icon: <Icon data={Check} size={12} />,
            },
            {key: 'region', value: 'eu-west'},
        ],
    },
};

const meta: Meta<DemoArgs> = {
    title: 'Components/MetaTable',
    component: MetaTable,
    tags: ['autodocs'],
    args: {
        example: 'basic',
    },
    argTypes: {
        example: {
            control: 'select',
            options: [
                'basic',
                'withTitle',
                'customLabels',
                'grouped',
                'tooltipsAndHelp',
                'booleanValues',
                'hiddenRow',
                'rowGap',
                'withIcon',
            ],
            description:
                'Ready-made item layouts: flat list, title, groups, tooltips, booleans, etc.',
        },
    },
    parameters: {
        layout: 'padded',
    },
    render: ({example}) => <MetaTable {...configs[example]} />,
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
