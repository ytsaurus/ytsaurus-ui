import {ReactNode} from 'react';
import {UnipikaValue} from '../components/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../components/SchemaDataType/dataTypes';
import {
    MethodErrors,
    TabletErrorsBaseParams,
    TabletErrorsByBundleResponse,
    TabletMethodError,
    YTError,
} from './error';

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

export type TabletErrorsApi = {
    tablet_errors_by_bundle: {
        body: TabletErrorsBaseParams & {tablet_cell_bundle: string; table_path?: string};
        response: TabletErrorsByBundleResponse;
    };
    tablet_errors_by_table: {
        body: TabletErrorsBaseParams & {table_path: string; table_id: string; tablet_id?: string};
        response: MethodErrors;
    };
    tablet_errors_by_table_and_timestamp: {
        body: TabletErrorsBaseParams & {table_id: string};
        response: Array<TabletMethodError>;
    };
};

export type TabletErrorsByPathState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    error_count_limit_exceeded?: boolean;

    table_id: string;
    table_path: string;
    data: TabletErrorsApi['tablet_errors_by_table']['response'] | undefined;
    total_row_count?: number | undefined;
    dataParams: Partial<TabletErrorsApi['tablet_errors_by_table']['body']> | undefined;

    timeRangeFilter:
        | {shortcutValue: string; from?: number; to?: number}
        | {from: number; to: number; shortcutValue?: undefined};

    methodsFilter: Array<string>;
    pageFilter: number;
    tabletIdFilter: string;
};

export const NavigationTab = {
    AUTO: 'auto',
    CONSUMER: 'consumer',
    CONTENT: 'content',
    FLOW: 'flow',
    QUEUE: 'queue',
    ATTRIBUTES: 'attributes',
    USER_ATTRIBUTES: 'user_attributes',
    ACL: 'acl',
    LOCKS: 'locks',
    SCHEMA: 'schema',
    TABLETS: 'tablets',
    TABLET_ERRORS: 'tablet_errors',
    ANNOTATION: 'annotation',
    ACCESS_LOG: 'access_log',
    MOUNT_CONFIG: 'mount_config',
    ORIGINATING_QUEUE: 'originating_queue',
} as const;
