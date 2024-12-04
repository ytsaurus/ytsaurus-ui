import React from 'react';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import SchemaDataType from '../../components/SchemaDataType/SchemaDataType';
import Yson from '../../components/Yson/Yson';
import unipika from '../../common/thor/unipika';
import Icon from '../../components/Icon/Icon';
import {ColumnCell} from '../../components/ColumnCell/ColumnCell';

import map_ from 'lodash/map';

import {TypeArray} from '../../components/SchemaDataType/dataTypes';
import type {YsonSettings} from '../../store/selectors/thor/unipika';

export function prepareColumns({
    columns,
    keyColumns,
    yqlTypes,
    ysonSettings,
    useRawStrings,
    schemaByName,
    onShowPreview,
}: {
    columns: {name: string; sortOrder?: string}[];
    keyColumns: string[];
    yqlTypes: TypeArray[] | null;
    ysonSettings: YsonSettings;
    useRawStrings: boolean | null | undefined;
    schemaByName: Record<string, any>;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void;
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
            />
        );
        const {sortOrder} = column;
        const isKeyColumn = keyColumns.indexOf(column.name) > -1;
        const {type_v3} = schemaByName[column.name] || {};
        const header = (
            <Tooltip content={Boolean(type_v3) && <SchemaDataType type_v3={type_v3} />}>
                <Yson value={unipika.unescapeKeyValue(column.name)} settings={ysonSettings} inline>
                    {isKeyColumn && (
                        <Icon
                            awesome={
                                sortOrder === 'descending'
                                    ? 'sort-amount-up'
                                    : 'sort-amount-down-alt'
                            }
                        />
                    )}
                </Yson>
            </Tooltip>
        );
        return Object.assign({}, column, {render, header});
    });
}
