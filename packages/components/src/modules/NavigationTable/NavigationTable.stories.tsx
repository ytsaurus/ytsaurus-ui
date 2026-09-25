import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import type {NavigationTableData} from '../../types';
import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../internal/Yson';
import {NavigationTable} from './NavigationTable';
import {
    type NavigationTableStoryState,
    navigationTableSampleAdditionalColumns,
    navigationTableSampleTable,
    navigationTableSampleTableWithTruncatedCell,
    navigationTableSampleTruncatedCell,
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
                table={state === 'empty' ? undefined : navigationTableSampleTable}
                emptyMessage={navigationTableStoryEmptyMessage}
                ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                additionalSchemaColumns={
                    state === 'withExtraColumns'
                        ? navigationTableSampleAdditionalColumns
                        : undefined
                }
                logError={() => undefined}
                onInsertTableSelect={() => undefined}
            />
        </div>
    ),
};

export default meta;

export const Default: StoryObj<DemoArgs> = {};

const TruncatedCellPreviewDemo = () => {
    const [table, setTable] = useState<NavigationTableData>(
        navigationTableSampleTableWithTruncatedCell,
    );

    const handleShowPreview = async (columnName: string, rowIndex: number) => {
        await new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
        setTable((prev) => ({
            ...prev,
            rows: prev.rows.map((row, index) =>
                index === rowIndex
                    ? {
                          ...(row as Record<string, unknown>),
                          [columnName]: navigationTableSampleTruncatedCell.fullValue,
                      }
                    : row,
            ),
        }));
    };

    return (
        <div style={navigationTableStoryFrameStyle}>
            <NavigationTable
                table={table}
                initialActiveTab="preview"
                ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                onShowPreview={handleShowPreview}
                logError={() => undefined}
            />
        </div>
    );
};

/**
 * Hover the truncated cell of the second row and press the eye button: `onShowPreview` loads the
 * full value and the consumer puts it back into `table`.
 */
export const TruncatedCellPreview: StoryObj<DemoArgs> = {
    parameters: {controls: {disable: true}},
    render: () => <TruncatedCellPreviewDemo />,
};
