import type {Decorator, Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import {DataTableYT, type DataTableYtProps} from './DataTableYT';
import {
    type DataTableYTDemoRow,
    type DataTableYTStoryArgs,
    THEME_LEGACY,
    THEME_YANDEX_CLOUD,
    dataTableYTDemoColumns,
    dataTableYTStoryDefaultArgs,
    dataTableYTStoryFrameStyle,
} from './dataTableYTStorySetup';

type StoryArgs = DataTableYTStoryArgs & {
    onRowClick?: DataTableYtProps<DataTableYTDemoRow>['onRowClick'];
};

const meta = {
    title: 'Components/DataTableYT',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Wrapper over `@gravity-ui/react-data-table` with YTsaurus styling (`useThemeYT`), empty/loading states, and `NoContent` when `loaded` and there are no rows.',
            },
        },
    },
    decorators: [
        ((Story) => (
            <div style={dataTableYTStoryFrameStyle}>
                <Story />
            </div>
        )) as Decorator<StoryArgs>,
    ],
    args: {
        ...dataTableYTStoryDefaultArgs,
        onRowClick: fn(),
    },
    argTypes: {
        data: {control: 'object'},
        settings: {control: 'object'},
        theme: {
            control: 'select',
            options: [THEME_YANDEX_CLOUD, THEME_LEGACY],
            if: {arg: 'useThemeYT', truthy: false},
        },
        onRowClick: {table: {disable: true}},
    },
    render: ({
        data,
        loaded,
        loading,
        useThemeYT,
        theme,
        disableRightGap,
        noItemsText,
        settings,
        onRowClick,
    }: StoryArgs) => {
        const common = {
            columns: dataTableYTDemoColumns,
            data,
            loaded,
            loading,
            disableRightGap,
            noItemsText,
            settings,
            onRowClick,
        } as const;

        if (useThemeYT) {
            return <DataTableYT<DataTableYTDemoRow> {...common} useThemeYT />;
        }

        return <DataTableYT<DataTableYTDemoRow> {...common} theme={theme} />;
    },
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {};

export const GravityTheme: Story = {
    args: {
        useThemeYT: false,
        theme: THEME_YANDEX_CLOUD,
    },
};

export const GravityLegacyTheme: Story = {
    name: 'Gravity theme (legacy)',
    args: {
        useThemeYT: false,
        theme: THEME_LEGACY,
    },
};

export const Empty: Story = {
    args: {
        data: [],
        loaded: true,
        loading: false,
    },
};

export const Loading: Story = {
    args: {
        data: [],
        loaded: false,
        loading: true,
    },
};
