import type {Meta, StoryObj} from '@storybook/react';

import {YtComponentsConfigProvider} from '../../context';
import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../internal/Yson';
import type {NavigationTableData} from '../../types';
import {NavigationTable} from './NavigationTable';

/** Context for SchemaTab (`prettyprint` must not get `asHTML: true` from spread). */
const storyUnipika = {
    showDecoded: true,
    asHTML: false as const,
};

const sampleTable: NavigationTableData = {
    name: '//home/demo/users',
    columns: ['id', 'name', 'score'],
    rows: [
        {
            id: {$type: 'string', $value: '1'},
            name: {$type: 'string', $value: 'Alice'},
            score: {$type: 'int64', $value: 100},
        },
        {
            id: {$type: 'string', $value: '2'},
            name: {$type: 'string', $value: 'Bob'},
            score: {$type: 'int64', $value: 95},
        },
    ],
    schema: [
        {name: 'id', required: true, type: 'String'},
        {name: 'name', required: true, type: 'String'},
        {name: 'score', required: false, type: 'Int64', sort_order: 'descending'},
    ],
    meta: [
        [
            {key: 'row_count', value: '2'},
            {key: 'sorted_by', value: 'score (desc)'},
        ],
    ],
    yqlTypes: null,
};

type DemoArgs = {
    state: 'withData' | 'empty';
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
            options: ['withData', 'empty'],
            description:
                'Loaded table (Schema / Preview / Meta tabs) or empty state when `table` is null.',
        },
    },
    parameters: {
        layout: 'padded',
    },
    render: ({state}: DemoArgs) => (
        <YtComponentsConfigProvider logError={() => undefined} unipika={storyUnipika}>
            <div style={{minWidth: 560}}>
                <NavigationTable
                    table={state === 'empty' ? null : sampleTable}
                    emptyMessage="No table is loaded for this path."
                    ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                />
            </div>
        </YtComponentsConfigProvider>
    ),
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};
