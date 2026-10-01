import {UnipikaValue} from '../internal/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../components/SchemaDataType';
import {MetaTableItem} from '../components';

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
    type_v3?: unknown;
};

export type NavigationTableMeta = MetaTableItem;

export type NavigationTableData = {
    name: string;
    rows: unknown[];
    columns: string[];
    schema: NavigationTableSchema[];
    meta: NavigationTableMeta[][];
    yqlTypes: unknown[] | null;
    /** Whether web_json excluded columns, including by explicit selection. */
    incompleteColumns?: boolean;
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
    /** Whether web_json excluded columns, including by explicit selection. */
    incompleteColumns?: boolean;
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
    incompleteColumns: boolean;
    columns: string[];
    omittedColumns?: string[];
    yqlTypes: TypeArray[] | null;
};
