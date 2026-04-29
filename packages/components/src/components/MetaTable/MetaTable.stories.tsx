import type {Meta, StoryObj} from '@storybook/react';

import {MetaTable} from './MetaTable';
import {
    type MetaTableStoryExampleKey,
    metaTableStoryConfigs,
    metaTableVisualCaseOrder,
} from './metaTableStorySetup';

type DemoArgs = {
    example: MetaTableStoryExampleKey;
};

const meta: Meta<DemoArgs> = {
    title: 'Components/MetaTable',
    tags: ['autodocs'],
    args: {
        example: 'basic',
    },
    argTypes: {
        example: {
            control: 'select',
            options: [...metaTableVisualCaseOrder],
            description:
                'Ready-made item layouts: flat list, title, groups, tooltips, booleans, etc.',
        },
    },
    parameters: {
        layout: 'padded',
    },
    render: ({example}) => <MetaTable {...metaTableStoryConfigs[example]} />,
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
