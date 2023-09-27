import {yqlModel} from '../models/shared';
import _ from 'lodash';
import {
    DataType,
    getType,
    isEmptyListDataType,
    isListDataType,
    isStructDataType,
} from '../models/dataTypes';

export const isColumnDownloadable = (column: {type: DataType}) => Boolean(column.type.simple);
export const isColumnSortable = (column: {type: DataType}) => Boolean(column.type.simple);
export const isColumnNumeric = (column: {type: DataType}) => Boolean(column.type.numeric);

export function getSpecialType(field: yqlModel.value.TypeArray): yqlModel.value.TypeArray {
    if (yqlModel.value.isHistogramTupleType(field)) {
        return [
            'HistogramTupleType',
            field[1].map((f) => ['HistogramType', f] as yqlModel.value.HistogramType),
        ];
    }
    if (yqlModel.value.isHistogramListType(field)) {
        return ['HistogramListType', ['HistogramType', field[1]]];
    }
    if (yqlModel.value.isHistogramStructType(field)) {
        return [
            'HistogramStructType',
            field[1].map((f) => ['HistogramType', f[1], f[0]] as yqlModel.value.HistogramType),
        ];
    }
    if (yqlModel.value.isVariantType(field)) {
        const variantType = field[1];
        if (yqlModel.value.isTupleType(variantType)) {
            return [
                yqlModel.value.VARIANT_TYPE,
                [variantType[0], variantType[1].map((el) => getSpecialType(el))],
            ];
        }
        if (yqlModel.value.isStructType(variantType)) {
            return [
                yqlModel.value.VARIANT_TYPE,
                [
                    variantType[0],
                    variantType[1].map((el) => {
                        if (yqlModel.value.isHistogramType(el[1])) {
                            return [el[0], ['HistogramType', el[1], el[0]]] as [
                                string,
                                yqlModel.value.HistogramType,
                            ];
                        }
                        return el;
                    }),
                ],
            ];
        }
    }
    if (yqlModel.value.isHistogramType(field)) {
        return ['HistogramType', field];
    }
    return field;
}
type ResultTypeUntyped = {
    resultType: 'untyped';
};
export type ColumnType = {
    name: string;
    index: number;
    downloadable: boolean;
    sortable: boolean;
    type: DataType;
};
type ResultTypeTableRow = {
    resultType: 'table' | 'row';
    optional: boolean;
    scheme: ColumnType[];
    columns: yqlModel.value.TypeArray[];
};
type ResultTypeCell = {
    resultType: 'cell';
    scheme: {
        type: DataType;
    };
    columns: yqlModel.value.TypeArray;
};
export type ResultType = ResultTypeUntyped | ResultTypeTableRow | ResultTypeCell;
export function getResultType(typeArray?: yqlModel.value.TypeArray): ResultType {
    if (!Array.isArray(typeArray)) {
        return {
            resultType: 'untyped',
        };
    }

    const dataType = getType(typeArray);
    const columnsType = isListDataType(dataType) ? dataType.type : dataType;

    let columns: yqlModel.value.TypeArray | unknown = typeArray;
    if (yqlModel.value.isListType(columns)) {
        columns = columns[1];
    }
    if (yqlModel.value.isStructType(columns)) {
        columns = columns[1];
    }
    if (yqlModel.value.isOptionalType(columns)) {
        columns = columns[1];
    }

    if (isStructDataType(columnsType) && Array.isArray(columns)) {
        return {
            optional: Boolean(columnsType.optional),
            resultType: yqlModel.value.isListType(typeArray) ? 'table' : 'row',
            scheme:
                columnsType.struct.map((field, index) => {
                    const {key: name, ...rest} = field;
                    return {
                        ...rest,
                        index,
                        name: `${name}`,
                        downloadable: isColumnDownloadable(field),
                        sortable: isColumnSortable(field),
                    };
                }) ?? [],
            columns: columns.map((field) => getSpecialType(field[1])),
        };
    }

    if (isEmptyListDataType(columnsType) && Array.isArray(columns)) {
        return {
            resultType: 'table',
            scheme: [],
            columns: [],
            optional: false,
        };
    }

    return {
        resultType: 'cell',
        scheme: {type: dataType},
        columns: typeArray,
    };
}
