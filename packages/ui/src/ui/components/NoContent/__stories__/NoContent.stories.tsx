import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {Button} from '@gravity-ui/uikit';

import {NoContent} from '../NoContent';

interface NoContentProps {
    className?: string;
    warning?: string;
    hint?: React.ReactNode;
    padding?: 'large' | 'regular';
    imageSize?: number;
}

export default {
    title: 'Components/NoContent',
    component: NoContent,
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
        warning: {
            control: 'text',
            description: 'Main warning message displayed to the user',
        },
        hint: {
            control: 'text',
            description: 'Additional hint or description text',
        },
        padding: {
            control: 'select',
            options: ['large', 'regular'],
            description: 'Padding size around the content',
        },
        imageSize: {
            control: 'number',
            description: 'Size of the illustration in pixels',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class name',
        },
    },
} as Meta<NoContentProps>;

type Story = StoryObj<NoContentProps>;

export const Default: Story = {
    args: {
        warning: 'No content available',
        hint: 'There is nothing to display at the moment',
        padding: 'regular',
        imageSize: 140,
    },
    render: (args) => <NoContent {...args} />,
};

export const WithLargePadding: Story = {
    args: {
        warning: 'No data found',
        hint: 'Try adjusting your filters or search criteria',
        padding: 'large',
        imageSize: 140,
    },
    render: (args) => <NoContent {...args} />,
};

export const WithCustomSize: Story = {
    args: {
        warning: 'Empty state',
        hint: 'This area will show content when available',
        padding: 'regular',
        imageSize: 200,
    },
    render: (args) => <NoContent {...args} />,
};

export const WithComplexHint: Story = {
    args: {
        warning: 'No results found',
        padding: 'regular',
        imageSize: 140,
    },
    render: (args) => (
        <NoContent
            {...args}
            hint={
                <div>
                    <p>We couldn&apos;t find any matching results.</p>
                    <p>Try the following:</p>
                    <ul style={{textAlign: 'left', marginTop: '8px'}}>
                        <li>Check your spelling</li>
                        <li>Use different keywords</li>
                        <li>Remove filters</li>
                    </ul>
                </div>
            }
        />
    ),
};

export const Playground: Story = {
    args: {
        warning: 'No content available',
        hint: 'This is a customizable playground',
        padding: 'regular',
        imageSize: 140,
    },
    render: (args) => (
        <div style={{height: '400px', border: '1px dashed #ccc', borderRadius: '8px'}}>
            <NoContent {...args} />
        </div>
    ),
};

export const WithAction: Story = {
    args: {
        warning: 'No items found',
        padding: 'large',
        imageSize: 160,
    },
    render: (args) => (
        <NoContent
            {...args}
            hint={
                <div>
                    <p style={{marginBottom: '16px'}}>You haven&apos;t created any items yet.</p>
                    <Button size="l" view="action">
                        Create First Item
                    </Button>
                </div>
            }
        />
    ),
};
