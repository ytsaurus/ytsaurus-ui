import {loadStaticTable} from './loadStaticTable';
import {loadDynamicTableRequest} from './loadDynamicTable';
import {loadTableAttributes} from './loadTableAttributes';
import {NavigationTable, NavigationTableSchema} from '../../types/navigation';
import {ypath} from '../../utils';
import {getTableTypeByAttributes} from './helpers/getTableTypeByAttributes';
import {getRequestOutputFormat} from './helpers/getRequestOutputFormat';
import {YTApiSetup} from '../rum-wrap-api';
import {makeMetaItems} from '../../components/MetaTable/presets';
import type {YtComponentsConfig} from '../../context';

export const loadTableAttributesByPath = async (
    path: string,
    setup: YTApiSetup,
    options: {
        clusterId: string;
        login: string;
        limit: number;
        cellSize?: number;
        defaultTableColumnLimit?: number;
        useYqlTypes?: boolean;
        docsUrls?: Record<string, string>;
        showDecoded?: boolean;
        navigationTableConfig?: Partial<YtComponentsConfig>;
    },
): Promise<NavigationTable> => {
    const attributes = await loadTableAttributes(path, setup);
    const schema: NavigationTableSchema[] = ypath.getValue(attributes.schema);
    const outputFormat = getRequestOutputFormat({
        columns: schema.map((i) => i.name),
        stringLimit: options?.cellSize,
        limit: options?.defaultTableColumnLimit,
        useYqlTypes: options?.useYqlTypes,
    });

    const requestFunction = attributes.dynamic ? loadDynamicTableRequest : loadStaticTable;

    const {columns, rows, yqlTypes} = await requestFunction({
        login: options.login,
        path,
        setup,
        schema,
        keyColumns: attributes.key_columns,
        limit: options.limit,
        outputFormat,
        ...(attributes.dynamic && {showDecoded: options.showDecoded}),
    });

    const meta = makeMetaItems({
        cluster: options.clusterId,
        attributes,
        tableType: getTableTypeByAttributes(attributes.dynamic, attributes),
        isDynamic: attributes.dynamic,
        docsUrls: options.docsUrls,
        navigationTableConfig: options.navigationTableConfig,
    });

    return {
        name: attributes.key,
        rows,
        schema,
        columns,
        yqlTypes,
        meta,
    };
};
