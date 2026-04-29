import type {CSSProperties} from 'react';

import type {NavigationTableData} from '../../types';

import type {NavigationTableInitialTab} from './NavigationTable';

/** Extra provider settings for stories/tests (SchemaTab uses `ysonSettings` from `NavigationTable`). */
export const navigationTableStoryUnipikaForProvider = {
    showDecoded: true,
    asHTML: false as const,
};

export const navigationTableSampleTable: NavigationTableData = {
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

export const navigationTableStoryFrameStyle: CSSProperties = {
    minWidth: 560,
};

export const navigationTableStoryEmptyMessage = 'No table is loaded for this path.';

export type NavigationTableStoryState = 'withData' | 'empty';

export const navigationTableVisualCaseOrder: NavigationTableStoryState[] = ['withData', 'empty'];

/** Playwright titles + `initialActiveTab` for non-default tabs (Schema is default). */
export const navigationTableWithDataVisualCases: Array<{
    testTitle: string;
    initialActiveTab?: NavigationTableInitialTab;
}> = [
    {testTitle: 'withData'},
    {testTitle: 'withData Preview', initialActiveTab: 'preview'},
    {testTitle: 'withData Meta', initialActiveTab: 'meta'},
];
