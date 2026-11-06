import React, {useMemo, useState} from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {Button, Checkbox, Flex, Text} from '@gravity-ui/uikit';

import {SegmentedRadioGroupOrSelect} from '../SegmentedRadioGroupOrSelect';
import {Toolbar} from '../../WithStickyToolbar/Toolbar/Toolbar';

import '../../WithStickyToolbar/WithStickyToolbar.scss';

const meta: Meta<typeof SegmentedRadioGroupOrSelect> = {
    title: 'Components/SegmentedRadioGroupOrSelect',
    component: SegmentedRadioGroupOrSelect,
    parameters: {
        layout: 'centered',
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
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const resizeTriggerElements = useMemo(() => [container], [container]);
    const [value, setValue] = React.useState<string>('option1');
    const [halfGrandParent, setHalfGrandParent] = React.useState(false);
    return (
        <Flex direction={'column'} gap={5} style={{width: 900}}>
            <Text variant={'header-1'}>SegmentedRadioGroupOrSelect</Text>
            <Checkbox checked={halfGrandParent} onUpdate={setHalfGrandParent}>
                Half grand-parent
            </Checkbox>

            <Flex
                ref={setContainer}
                style={{width: halfGrandParent ? '50%' : '100%', overflow: 'hidden'}}
            >
                <Flex
                    gap={2}
                    alignItems={'center'}
                    shrink={1}
                    grow={0}
                    wrap
                    style={{overflow: 'hidden'}}
                >
                    <SegmentedRadioGroupOrSelect
                        resizeTriggerElements={resizeTriggerElements}
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

function ResizeableButton({children}: {children: React.ReactNode}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div style={{width: expanded ? 650 : 180}}>
            <Button width="max" onClick={() => setExpanded(!expanded)}>
                {children}
            </Button>
        </div>
    );
}

function ObserveNeighborsDemo({observeSpacer = false}: {observeSpacer?: boolean}) {
    const [value, setValue] = useState('option1');
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [spacer, setSpacer] = useState<HTMLDivElement | null>(null);
    const [firstNeighbor, setFirstNeighbor] = useState<HTMLDivElement | null>(null);
    const [secondNeighbor, setSecondNeighbor] = useState<HTMLDivElement | null>(null);
    const [showFirst, setShowFirst] = useState(true);
    const [replacement, setReplacement] = useState(0);
    const resizeTriggerElements = useMemo(
        () => (observeSpacer ? [container, spacer] : [container, firstNeighbor, secondNeighbor]),
        [container, spacer, firstNeighbor, secondNeighbor, observeSpacer],
    );
    return (
        <Flex direction="column" gap={3} style={{width: 1400}}>
            <Checkbox checked={showFirst} onUpdate={setShowFirst}>
                Show first neighbor
            </Checkbox>
            <Button onClick={() => setReplacement((previous) => previous + 1)}>
                Replace second neighbor
            </Button>
            <Toolbar
                containerRef={setContainer}
                itemsToWrap={[
                    {
                        name: 'selector',
                        shrinkable: true,
                        node: (
                            <SegmentedRadioGroupOrSelect
                                value={value}
                                options={OPTIONS}
                                onUpdate={setValue}
                                resizeTriggerElements={resizeTriggerElements}
                            />
                        ),
                    },
                    {
                        name: 'first',
                        elementRef: setFirstNeighbor,
                        node: showFirst && (
                            <ResizeableButton>Resize first neighbor</ResizeableButton>
                        ),
                    },
                    {
                        name: `second-${replacement}`,
                        elementRef: setSecondNeighbor,
                        node: <ResizeableButton>Resize second neighbor</ResizeableButton>,
                    },
                    {
                        name: 'spacer',
                        elementRef: setSpacer,
                        growable: true,
                        shrinkable: true,
                        node: <span />,
                    },
                ]}
            />
            <Text>Selected value: {value}</Text>
        </Flex>
    );
}

export const ObserveNeighbors: Story = {
    render: () => <ObserveNeighborsDemo />,
};

export const ObserveSpacer: Story = {
    render: () => <ObserveNeighborsDemo observeSpacer />,
};
