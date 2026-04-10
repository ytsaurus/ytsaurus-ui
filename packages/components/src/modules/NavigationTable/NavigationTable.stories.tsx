import type {Meta, StoryObj} from '@storybook/react';

import {YtComponentsConfigProvider} from '../../context';
import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../internal/Yson';
import {NavigationTable} from './NavigationTable';
import {
    type NavigationTableStoryState,
    navigationTableSampleTable,
    navigationTableStoryEmptyMessage,
    navigationTableStoryFrameStyle,
    navigationTableStoryUnipikaForProvider,
    navigationTableVisualCaseOrder,
} from './navigationTableStorySetup';

type DemoArgs = {
    state: NavigationTableStoryState;
};

const meta: Meta<DemoArgs> = {
    title: 'Modules/NavigationTable',
    component: NavigationTable,
    tags: ['autodocs'],
    args: {
        state: 'withData',
    },
    argTypes: {
        state: {
            control: 'inline-radio',
            options: [...navigationTableVisualCaseOrder],
            description:
                'Loaded table (Schema / Preview / Meta tabs) or empty state when `table` is null.',
        },
    },
    parameters: {
        layout: 'padded',
    },
    render: ({state}: DemoArgs) => (
        <YtComponentsConfigProvider
            logError={() => undefined}
            unipika={navigationTableStoryUnipikaForProvider}
        >
            <div style={navigationTableStoryFrameStyle}>
                <NavigationTable
                    table={state === 'empty' ? null : navigationTableSampleTable}
                    emptyMessage={navigationTableStoryEmptyMessage}
                    ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                />
            </div>
        </YtComponentsConfigProvider>
    ),
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
