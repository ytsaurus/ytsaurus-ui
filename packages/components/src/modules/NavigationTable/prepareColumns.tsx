import React from 'react';

import {Tooltip} from '../../components/Tooltip';
import {
    SchemaDataType,
    type SchemaDataTypeProps,
    type TypeArray,
} from '../../components/SchemaDataType';
import {Yson} from '../../internal/Yson';
import unipika from '../../utils/unipika';
import {Icon} from '@gravity-ui/uikit';
import {ColumnCell} from '../../components/ColumnCell';
import map_ from 'lodash/map';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import BarsDescendingAlignLeftArrowUpIcon from '@gravity-ui/icons/svgs/bars-descending-align-left-arrow-up.svg';
import BarsAscendingAlignLeftArrowDownIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-down.svg';

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
                <Yson value={unipika.unescapeKeyValue(column.name)} settings={ysonSettings} inline>
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
