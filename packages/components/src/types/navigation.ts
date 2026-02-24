import {ReactNode} from 'react';
import {UnipikaValue} from '../internal/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../components/SchemaDataType';

export type NavigationNode = {
    name: string;
    type?: string;
    broken?: boolean;
    dynamic?: boolean;
    sorted?: boolean;
    path: string;
    targetPath?: string;
    isFavorite: boolean;
};

export type NavigationTableSchema = {
    name: string;
    required: boolean;
    sort_order?: string;
    type: string;
};

export type NavigationTableMeta = {
    key: string;
    value: ReactNode;
    visible?: boolean;
    label?: string;
};

export type NavigationTableData = {
    name: string;
    rows: unknown[];
    columns: string[];
    schema: NavigationTableSchema[];
    meta: NavigationTableMeta[][];
    yqlTypes: unknown[] | null;
};

export type NavigationTableDataAdapter = {
    loadTable: (path: string) => Promise<NavigationTableData | null>;
};

export type NavigationTable = {
    name: string;
    rows: any[];
    columns: string[];
    schema: NavigationTableSchema[];
    meta: NavigationTableMeta[][];
    yqlTypes: unknown[] | null;
};

export type ReadTableDataResult =
    | {
          useYqlTypes: true;
          rows: Array<Record<string, [UnipikaValue, `${number}`]>>;
      }
    | {
          useYqlTypes?: false;
          rows: Array<Record<string, UnipikaValue>>;
      };

export type ReadTableResult = ReadTableDataResult & {
    columns: string[];
    omittedColumns?: string[];
    yqlTypes: TypeArray[] | null;
};
