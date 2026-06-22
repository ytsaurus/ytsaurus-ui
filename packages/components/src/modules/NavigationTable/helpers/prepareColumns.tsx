import React from 'react';

import {Tooltip} from '../../../components/Tooltip';
import {
    SchemaDataType,
    type SchemaDataTypeProps,
    type TypeArray,
} from '../../../components/SchemaDataType';
import {YSON_DEFAULT_UNIPIKA_SETTINGS, Yson} from '../../../internal/Yson';
import unipika from '../../../utils/unipika';
import {ColumnCell} from '../../../components/ColumnCell';
import map_ from 'lodash/map';
import type {UnipikaSettings} from '../../../internal/Yson/StructuredYson/StructuredYsonTypes';
import {Column} from '../../../components/DataTableYT/DataTableYT';
import {LogErrorFn, NavigationTableData, NavigationTableSchema} from '../../../types';
import type {ErrorBoundaryProps} from '../../../internal/DefaultErrorBoundary';
import {sortColumnsBySchema} from './sortColumnsBySchema';

type Params = {
    table: NavigationTableData;
    ysonSettings?: UnipikaSettings;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void;
    useYqlTypes?: boolean;
    primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    logError?: LogErrorFn;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
};

export const prepareColumns = ({
    table,
    ysonSettings,
    onShowPreview,
    useYqlTypes,
    primitiveTypes,
    logError,
    ErrorBoundaryComponent,
}: Params): Column<unknown>[] => {
    const sortedColumns = sortColumnsBySchema(table.columns, table.schema);
    const schemaByName = table.schema.reduce<Record<string, NavigationTableSchema>>((acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {});

    return map_(sortedColumns, (column) => {
        const render = ({value, index}: {value?: any; index: number; row: any}) => (
            <ColumnCell
                value={value}
                yqlTypes={(table.yqlTypes as TypeArray[]) || []}
                ysonSettings={ysonSettings}
                rowIndex={index}
                columnName={column}
                onShowPreview={onShowPreview}
                useYqlTypes={useYqlTypes}
                logError={logError}
                ErrorBoundaryComponent={ErrorBoundaryComponent}
            />
        );

        const typeV3 = schemaByName[column]?.type_v3;
        const header = (
            <Tooltip
                content={
                    typeV3 ? (
                        <SchemaDataType typeV3={typeV3} primitiveTypes={primitiveTypes} />
                    ) : null
                }
            >
                <Yson
                    value={unipika.unescapeKeyValue(column)}
                    settings={ysonSettings ?? YSON_DEFAULT_UNIPIKA_SETTINGS}
                    inline
                />
            </Tooltip>
        );

        return {name: column, render, header};
    });
};
