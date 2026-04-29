import type {Meta, StoryObj} from '@storybook/react';

import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../internal/Yson';
import {NavigationTable} from './NavigationTable';
import {
    type NavigationTableStoryState,
    navigationTableSampleTable,
    navigationTableStoryEmptyMessage,
    navigationTableStoryFrameStyle,
    navigationTableVisualCaseOrder,
} from './navigationTableStorySetup';

type DemoArgs = {
    state: NavigationTableStoryState;
};

const meta: Meta<DemoArgs> = {
    title: 'Modules/NavigationTable',
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
        <div style={navigationTableStoryFrameStyle}>
            <NavigationTable
                table={state === 'empty' ? null : navigationTableSampleTable}
                emptyMessage={navigationTableStoryEmptyMessage}
                ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                logError={() => undefined}
                onInsertTableSelect={() => undefined}
            />
        </div>
    ),
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
