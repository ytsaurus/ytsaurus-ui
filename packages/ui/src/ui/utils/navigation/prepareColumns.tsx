import React from 'react';
import Yson from '../../components/Yson/Yson';
import unipika from '../../common/thor/unipika';
import Icon from '../../components/Icon/Icon';
import {ColumnCell, SchemaDataType, Tooltip, type TypeArray} from '@ytsaurus/components';

import map_ from 'lodash/map';

import {type YsonSettings} from '../../store/selectors/thor/unipika';

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
    ysonSettings: YsonSettings;
    useRawStrings: boolean | null | undefined;
    schemaByName: Record<string, any>;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void;
    useYqlTypes?: boolean;
    primitiveTypes: Set<string>;
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
        const {type_v3} = schemaByName[column.name] || {};
        const header = (
            <Tooltip
                content={
                    Boolean(type_v3) && (
                        <SchemaDataType typeV3={type_v3} primitiveTypes={primitiveTypes} />
                    )
                }
            >
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
