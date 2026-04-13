import React from 'react';

import {Tooltip} from '../../components/Tooltip';
import {
    SchemaDataType,
    type SchemaDataTypeProps,
    type TypeArray,
} from '../../components/SchemaDataType';
import {YSON_DEFAULT_UNIPIKA_SETTINGS, Yson} from '../../internal/Yson';
import unipika from '../../utils/unipika';
import {Icon} from '@gravity-ui/uikit';
import {ColumnCell} from '../../components/ColumnCell';
import map_ from 'lodash/map';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import BarsDescendingAlignLeftArrowUpIcon from '@gravity-ui/icons/svgs/bars-descending-align-left-arrow-up.svg';
import BarsAscendingAlignLeftArrowDownIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-down.svg';
import {LogErrorFn} from '../../types';
import type {ErrorBoundaryProps} from '../../internal/DefaultErrorBoundary';

export type NameWithSortOrder = {name: string; sortOrder?: string};

export function prepareColumns({
    columns,
    keyColumns,
    yqlTypes,
    ysonSettings,
    useRawStrings,
    schemaByName,
    onShowPreview,
    useYqlTypes,
    primitiveTypes,
    logError,
    ErrorBoundaryComponent,
}: {
    columns: NameWithSortOrder[];
    keyColumns: string[];
    yqlTypes?: TypeArray[] | null;
    ysonSettings?: UnipikaSettings;
    useRawStrings: boolean | null | undefined;
    schemaByName: Record<string, any>;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void;
    useYqlTypes?: boolean;
    primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    logError?: LogErrorFn;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
}) {
    return map_(columns, (column) => {
        const render = ({value, index}: {value?: any; index: number; row: any}) => (
            <ColumnCell
                allowRawStrings={useRawStrings}
                value={value}
                yqlTypes={yqlTypes || []}
                ysonSettings={ysonSettings}
                rowIndex={index}
                columnName={column.name}
                onShowPreview={onShowPreview}
                useYqlTypes={useYqlTypes}
                logError={logError}
                ErrorBoundaryComponent={ErrorBoundaryComponent}
            />
        );
        const {sortOrder} = column;
        const isKeyColumn = keyColumns.indexOf(column.name) > -1;
        const {type_v3: typeV3} = schemaByName[column.name] || {};
        const header = (
            <Tooltip
                content={
                    Boolean(typeV3) && (
                        <SchemaDataType typeV3={typeV3} primitiveTypes={primitiveTypes} />
                    )
                }
            >
                <Yson
                    value={unipika.unescapeKeyValue(column.name)}
                    settings={ysonSettings ?? YSON_DEFAULT_UNIPIKA_SETTINGS}
                    inline
                >
                    {isKeyColumn && (
                        <Icon
                            data={
                                sortOrder === 'descending'
                                    ? BarsDescendingAlignLeftArrowUpIcon
                                    : BarsAscendingAlignLeftArrowDownIcon
                            }
                            size={16}
                        />
                    )}
                </Yson>
            </Tooltip>
        );
        return Object.assign({}, column, {render, header});
    });
}
