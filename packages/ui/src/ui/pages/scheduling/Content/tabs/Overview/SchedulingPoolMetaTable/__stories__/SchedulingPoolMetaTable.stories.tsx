import React from 'react';

import {MetaTable, type MetaTableItem, type MetaTableProps} from '@ytsaurus/components';
import {type Decorator, type Meta, type StoryObj} from '@storybook/react';

import {configureUIFactory} from '../../../../../../../UIFactory';
import {defaultUIFactory} from '../../../../../../../UIFactory/default-ui-factory';

import {SchedulingPoolMetaTable} from '../SchedulingPoolMetaTable';

const poolMetaTableProps: MetaTableProps = {
    items: [
        [
            {key: 'mode', label: 'Mode', value: 'Fair share'},
            {key: 'weight', label: 'Weight', value: '1'},
            {key: 'operations-running', label: 'Running operations', value: '3'},
        ],
        [
            {key: 'cpu', label: 'CPU', value: '12 / 24'},
            {key: 'ram', label: 'RAM', value: '64 / 128 GiB'},
        ],
    ],
    subTitles: ['General', 'Usage / Strong guarantees'],
};

const customMetadataItems: Array<MetaTableItem> = [
    {key: 'owner', label: 'Owner', value: 'custom-scheduler'},
    {key: 'last-update', label: 'Last update', value: '2026-01-01 12:00:00'},
];

function renderCustomizedPoolMetaTable(props: MetaTableProps) {
    const items = Array.isArray(props.items[0])
        ? (props.items as Array<Array<MetaTableItem>>)
        : [props.items as Array<MetaTableItem>];

    return (
        <MetaTable
            {...props}
            items={[...items, customMetadataItems]}
            subTitles={[...(props.subTitles ?? []), 'Custom metadata']}
        />
    );
}

const withCustomPoolMetaTable: Decorator = (Story) => {
    configureUIFactory({
        ...defaultUIFactory,
        renderSchedulingPoolMetaTable: renderCustomizedPoolMetaTable,
    });

    return <Story />;
};

const meta: Meta<typeof SchedulingPoolMetaTable> = {
    title: 'Pages/Scheduling/PoolMetaTable',
    component: SchedulingPoolMetaTable,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div style={{minWidth: 900, padding: 20}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof SchedulingPoolMetaTable>;

export const Default: Story = {
    args: poolMetaTableProps,
};

export const Customized: Story = {
    args: poolMetaTableProps,
    decorators: [withCustomPoolMetaTable],
};
