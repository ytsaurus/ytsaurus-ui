import React, {type CSSProperties} from 'react';

import {YtComponentsConfigProvider} from '../../context';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {TypeArray} from '../SchemaDataType/dataTypes';

/** Same shape as stories; shared with Playwright visual tests (no Storybook imports). */
export type ColumnCellStoryUnipikaSettings = Omit<
    UnipikaSettings,
    'validateSrcUrl' | 'normalizeUrl'
>;

export type ColumnCellStoryArgs = {
    className?: string;
    value: unknown;
    yqlTypes: TypeArray[] | null;
    ysonSettings: ColumnCellStoryUnipikaSettings;
    allowRawStrings: boolean | null;
    rowIndex: number;
    columnName: string;
    useYqlTypes?: boolean;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void | Promise<void>;
};

export const defaultColumnCellYsonSettings: ColumnCellStoryUnipikaSettings = {
    format: 'yson',
    showDecoded: false,
    compact: true,
    escapeWhitespace: false,
    binaryAsHex: true,
    asHTML: true,
    treatValAsData: true,
    indent: 4,
    break: true,
    escapeYQLStrings: true,
    nonBreakingIndent: true,
};

export const columnCellStoryBaseArgsForVisual: Omit<ColumnCellStoryArgs, 'onShowPreview'> = {
    columnName: 'sample_column',
    rowIndex: 0,
    allowRawStrings: false,
    useYqlTypes: true,
    ysonSettings: defaultColumnCellYsonSettings,
    yqlTypes: [['DataType', 'String']] as TypeArray[],
    value: ['hello', 0] as unknown,
};

export const columnCellStoryFrameStyle: CSSProperties = {
    minWidth: 280,
    minHeight: 56,
    padding: 12,
    border: '1px dashed var(--g-color-line-generic, #ddd)',
    borderRadius: 8,
};

export function ColumnCellStoryDecorator({children}: {children: React.ReactNode}) {
    return (
        <YtComponentsConfigProvider
            logError={() => undefined}
            unipika={defaultColumnCellYsonSettings}
        >
            <div style={columnCellStoryFrameStyle}>{children}</div>
        </YtComponentsConfigProvider>
    );
}
