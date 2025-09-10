import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {Button} from '@gravity-ui/uikit';

import {CountsList, CountsListProps} from '../CountsList';

export default {
    title: 'Components/CountsList',
    component: CountsList,
    parameters: {
        a11y: {
            element: '#storybook-root',
            config: {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: false,
                    },
                ],
            },
        },
    },
    argTypes: {
        items: {
            control: 'object',
            description: 'Array of items with type and count properties',
        },
        hideAll: {
            control: 'boolean',
            description: 'Whether to hide the "All" item in the list',
        },
        selectedItems: {
            control: 'object',
            description: 'Array of selected items to show count for',
        },
        renderActions: {
            control: false,
            description: 'Function to render action buttons for selected items',
        },
    },
} as Meta<CountsListProps>;

type Story = StoryObj<CountsListProps>;

const mockItems = [
    {type: 'table', count: 150},
    {type: 'file', count: 89},
    {type: 'document', count: 45},
    {type: 'map_node', count: 23},
    {type: 'link', count: 12},
];

export const Default: Story = {
    args: {
        items: mockItems,
        hideAll: false,
    },
    render: (args) => <CountsList {...args} />,
};

export const WithHiddenAll: Story = {
    args: {
        items: mockItems,
        hideAll: true,
    },
    render: (args) => <CountsList {...args} />,
};

export const WithSelectedItems: Story = {
    args: {
        items: mockItems,
        hideAll: false,
        selectedItems: ['item1', 'item2', 'item3'],
    },
    render: (args) => <CountsList {...args} />,
};

export const WithSelectedItemsAndActions: Story = {
    args: {
        items: mockItems,
        hideAll: false,
        selectedItems: ['item1', 'item2'],
    },
    render: (args) => (
        <CountsList
            {...args}
            renderActions={() => (
                <Button size="s" view="outlined-action" style={{marginLeft: '8px'}}>
                    Actions
                </Button>
            )}
        />
    ),
};

export const LargeList: Story = {
    args: {
        items: [
            {type: 'table', count: 1500},
            {type: 'file', count: 890},
            {type: 'document', count: 450},
            {type: 'map_node', count: 230},
            {type: 'link', count: 120},
            {type: 'replica', count: 89},
            {type: 'chunk', count: 67},
            {type: 'job', count: 412315},
        ],
        hideAll: false,
    },
    render: (args) => <CountsList {...args} />,
};

export const EmptyList: Story = {
    args: {
        items: [],
        hideAll: false,
    },
    render: (args) => <CountsList {...args} />,
};

export const SingleItem: Story = {
    args: {
        items: [{type: 'table', count: 42}],
        hideAll: false,
    },
    render: (args) => <CountsList {...args} />,
};

export const Playground: Story = {
    args: {
        items: mockItems,
        hideAll: false,
        selectedItems: ['item1'],
    },
    render: (args) => (
        <div style={{padding: '20px', border: '1px dashed #ccc', borderRadius: '8px'}}>
            <CountsList
                {...args}
                renderActions={() => (
                    <div>
                        <Button size="s" view="outlined-action" style={{marginRight: '4px'}}>
                            Edit
                        </Button>
                        <Button size="s" view="outlined-danger">
                            Delete
                        </Button>
                    </div>
                )}
            />
        </div>
    ),
};
