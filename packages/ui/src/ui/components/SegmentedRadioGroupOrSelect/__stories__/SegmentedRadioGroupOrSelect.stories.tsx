import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {Checkbox, Flex, Text} from '@gravity-ui/uikit';

import {SegmentedRadioGroupOrSelect} from '../SegmentedRadioGroupOrSelect';

const meta: Meta<typeof SegmentedRadioGroupOrSelect> = {
    title: 'Components/SegmentedRadioGroupOrSelect',
    component: SegmentedRadioGroupOrSelect,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        observeWidthBy: {
            control: 'select',
            options: ['parent', 'grandparent'],
            description: 'Which ancestor element to observe width for mode switching',
        },
    },
    decorators: [
        (Story) => (
            <div style={{padding: '20px'}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof SegmentedRadioGroupOrSelect>;

const OPTIONS = [
    {value: 'option1' as const, text: 'Option 1'},
    {value: 'option2' as const, text: 'Option 2'},
    {value: 'option3' as const, text: 'Option 3'},
    {value: 'option4' as const, text: 'Option 4'},
    {value: 'option5' as const, text: 'Option 5'},
    {value: 'option6' as const, text: 'Option 6'},
    {value: 'option7' as const, text: 'Option 7'},
    {value: 'option8' as const, text: 'Option 8'},
    {value: 'option9' as const, text: 'Option 9'},
    {value: 'option10' as const, text: 'Option 10'},
];

function ObserveParentDemo() {
    const [value, setValue] = React.useState<string>('option1');
    const [halfParent, setHalfParent] = React.useState(false);
    return (
        <Flex direction={'column'} gap={5} style={{width: 900}}>
            <Text variant={'header-1'}>SegmentedRadioGroupOrSelect</Text>
            <Checkbox checked={halfParent} onUpdate={setHalfParent}>
                Half parent
            </Checkbox>

            <Flex>
                <Flex
                    gap={2}
                    alignItems={'center'}
                    wrap
                    style={{overflow: 'hidden', width: halfParent ? '50%' : '100%'}}
                >
                    <SegmentedRadioGroupOrSelect
                        value={value}
                        options={OPTIONS}
                        onUpdate={setValue}
                    />
                </Flex>
                <div>end</div>
            </Flex>

            <div>
                <Text variant={'body-1'}>Selected value: {value}</Text>
            </div>
        </Flex>
    );
}

export const ObserveParent: Story = {
    render: () => <ObserveParentDemo />,
    parameters: {
        docs: {
            description: {
                story: 'Showcase of SegmentedRadioGroupOrSelect with all options.',
            },
        },
    },
};

function ObserverGrandParentDemo() {
    const [value, setValue] = React.useState<string>('option1');
    const [halfGrandParent, setHalfGrandParent] = React.useState(false);
    return (
        <Flex direction={'column'} gap={5} style={{width: 900}}>
            <Text variant={'header-1'}>SegmentedRadioGroupOrSelect</Text>
            <Checkbox checked={halfGrandParent} onUpdate={setHalfGrandParent}>
                Half grand-parent
            </Checkbox>

            <Flex style={{width: halfGrandParent ? '50%' : '100%', overflow: 'hidden'}}>
                <Flex
                    gap={2}
                    alignItems={'center'}
                    shrink={1}
                    grow={0}
                    wrap
                    style={{overflow: 'hidden'}}
                >
                    <SegmentedRadioGroupOrSelect
                        observeWidthBy="grandparent"
                        value={value}
                        options={OPTIONS}
                        onUpdate={setValue}
                    />
                </Flex>
                <div style={{flexGrow: 1}}>end</div>
            </Flex>

            <div>
                <Text variant={'body-1'}>Selected value: {value}</Text>
            </div>
        </Flex>
    );
}

export const ObserveGrandParent: Story = {
    render: () => <ObserverGrandParentDemo />,
    parameters: {
        docs: {
            description: {
                story: 'Showcase of SegmentedRadioGroupOrSelect with all options.',
            },
        },
    },
};
