import type {Decorator, Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import {type Column, DataTableYT, type DataTableYtProps} from './DataTableYT';

const THEME_YANDEX_CLOUD = 'yandex-cloud';
const THEME_LEGACY = 'legacy';

type DemoRow = {
    id: string;
    name: string;
    value: number;
};

const demoColumns: Column<DemoRow>[] = [
    {name: 'id', title: 'ID', width: 100},
    {name: 'name', title: 'Name'},
    {
        name: 'value',
        title: 'Value',
        width: 100,
        align: 'right',
        render: ({value}) => (
            <span>{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
        ),
    },
];

const sampleData: DemoRow[] = [
    {id: 'row-1', name: 'Alpha', value: 100},
    {id: 'row-2', name: 'Beta', value: 250},
    {id: 'row-3', name: 'Gamma', value: 42},
];

type DataTableYTStoryArgs = {
    data: DemoRow[];
    loaded?: boolean;
    loading?: boolean;
    useThemeYT: boolean;
    theme: string;
    disableRightGap?: boolean;
    noItemsText?: string;
    settings: NonNullable<DataTableYtProps<DemoRow>['settings']>;
    onRowClick?: DataTableYtProps<DemoRow>['onRowClick'];
};

const meta = {
    title: 'Components/DataTableYT',
    component: DataTableYT,
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
            <div style={{maxWidth: 720}}>
                <Story />
            </div>
        )) as Decorator<DataTableYTStoryArgs>,
    ],
    args: {
        data: sampleData,
        loaded: true,
        loading: false,
        useThemeYT: true,
        theme: THEME_YANDEX_CLOUD,
        disableRightGap: false,
        settings: {
            displayIndices: false,
            sortable: true,
            stripedRows: true,
        },
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
    }: DataTableYTStoryArgs) => {
        const common = {
            columns: demoColumns,
            data,
            loaded,
            loading,
            disableRightGap,
            noItemsText,
            settings,
            onRowClick,
        } as const;

        if (useThemeYT) {
            return <DataTableYT<DemoRow> {...common} useThemeYT />;
        }

        return <DataTableYT<DemoRow> {...common} theme={theme} />;
    },
} satisfies Meta<DataTableYTStoryArgs>;

export default meta;

type Story = StoryObj<DataTableYTStoryArgs>;

export const Default: Story = {};

export const GravityTheme: Story = {
    args: {
        useThemeYT: false,
        theme: THEME_YANDEX_CLOUD,
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
