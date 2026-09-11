import React, {useState} from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {type BundleData, BundleTableField} from '../BundleTableField';

const normal = makeRow('normal', 'Normal configuration');
const deprecated = makeRow('deprecated', 'Deprecated configuration', 'Use normal instead');
const deprecatedWithoutReason = makeRow('legacy', 'Deprecated without reason');
const longDeprecated = makeRow(
    'long-deprecated',
    'Deprecated configuration with a deliberately very long type name',
    'This configuration is available only for existing bundles',
);

const meta: Meta<typeof BundleTableField> = {
    title: 'Pages/Tablet cell bundles/BundleTableField',
    component: BundleTableField,
    parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof BundleTableField>;

function StatefulTable({initialType, data}: {initialType: string; data: BundleData[]}) {
    const initialValue = data.find(({id}) => id === initialType)?.initialData;
    const [value, setValue] = useState(initialValue);

    return <BundleTableField value={value} onChange={setValue} data={data} />;
}

export const NormalSelected: Story = {
    render: () => <StatefulTable initialType={normal.id} data={[normal, deprecated]} />,
};

export const DeprecatedSelected: Story = {
    render: () => <StatefulTable initialType={deprecated.id} data={[normal, deprecated]} />,
};

export const DeprecatedWithoutReason: Story = {
    render: () => (
        <StatefulTable
            initialType={deprecatedWithoutReason.id}
            data={[normal, deprecatedWithoutReason]}
        />
    ),
};

export const NarrowLongType: Story = {
    render: () => (
        <div style={{width: 440}}>
            <StatefulTable initialType={longDeprecated.id} data={[normal, longDeprecated]} />
        </div>
    ),
};

export const SelectionChange: Story = {
    render: () => <StatefulTable initialType={normal.id} data={[normal, deprecated]} />,
};

function makeRow(id: string, type: string, deprecationReason?: string): BundleData {
    const isDeprecated = id !== 'normal';
    const initialData = {type: id, memory: 8e9, vcpu: 4000, net: 1e9};

    return {
        id,
        type,
        memory: '8 GB',
        vcpu: '4',
        net: '1 GB/s',
        deprecated: isDeprecated,
        deprecationReason,
        initialData,
    };
}
