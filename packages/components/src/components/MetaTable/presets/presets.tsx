import {format, ypath} from '../../../utils';
import {Label, LabelOnOff} from '../../Label';
import {Template} from '../templates/Template';
import {compression} from './compression';
import {erasureReplication} from './erasure-replication';
import {metaTablePresetSize} from './size';
import {metaTablePresetMain} from './main';
import {getCommonFields} from './helpers/commonFields';
import type {TYComponentsNavigationMetaConfig} from '../../../types';

import i18n from './i18n';
import {RowsCount} from '../templates/RowsCount/RowsCount';

export const CypressNodeTypes = {
    REPLICATED_TABLE: 'replicated_table',
    REPLICATION_LOG_TABLE: 'replication_log_table',
    CHAOS_REPLICATED_TABLE: 'chaos_replicated_table',
    MAP_NODE: 'map_node',
    TABLE: 'table',
};

export function replicatedTableTracker(attributes: any) {
    const value = ypath.getValue(
        attributes,
        '/replicated_table_options/replicated_table_tracker_enabled',
    );
    return {
        key: 'replicated_table_tracker',
        value: <LabelOnOff value={value} />,
        visible: value !== undefined,
    };
}

export function tableSize(attributes: any, isDynamic: boolean, mediumList: string[]) {
    const [rowCount, chunkCount, dataWeight] = ypath.getValues(attributes, [
        '/chunk_row_count',
        '/chunk_count',
        '/data_weight',
    ]);

    return [
        {
            key: 'rowCount',
            label: 'Rows',
            value: <RowsCount isDynamic={isDynamic} count={rowCount} />,
            visible: rowCount !== undefined,
        },
        {
            key: 'chunkCount',
            label: 'Chunks',
            value: format['Number'](chunkCount),
            visible: chunkCount !== undefined,
        },
        ...metaTablePresetSize(attributes, mediumList),
        {
            key: 'dataWeight',
            label: 'Data weight',
            value: <Template.FormattedValue value={dataWeight} format="Bytes" />,
            tooltip: i18n('context_data-weight'),
            visible: dataWeight !== undefined,
        },
    ];
}

export function tableStorage(
    attributes: any,
    tableType: string,
    options: {docsUrls?: Record<string, string>} = {},
) {
    const optimizeFor = ypath.getValue(attributes, '/optimize_for');
    return [
        {
            key: 'tableType',
            label: 'Table type',
            value: tableType,
        },
        {
            key: 'optimizeFor',
            label: 'Optimize for',
            value: <Label text={format['ReadableField'](optimizeFor)} theme="info" />,
            visible: optimizeFor !== 'undefined',
        },
        ...compression(attributes),
        ...erasureReplication(attributes, options),
        replicatedTableTracker(attributes),
    ];
}

export function dynTableInfo(
    attributes: any,
    cluster: string,
    tabletErrorCount: number,
    config?: Partial<TYComponentsNavigationMetaConfig>,
) {
    const [tabletCellBundle, tabletState, inMemoryMode] = ypath.getValues(attributes, [
        '/tablet_cell_bundle',
        '/tablet_state',
        '/in_memory_mode',
    ]);

    const TabletCellBundleLink = config?.TabletCellBundleLink;

    return [
        {
            key: 'tabletCellBundle',
            label: 'Tablet cell bundle',
            value: tabletCellBundle ? (
                TabletCellBundleLink ? (
                    <TabletCellBundleLink cluster={cluster} tabletCellBundle={tabletCellBundle} />
                ) : (
                    tabletCellBundle
                )
            ) : (
                format.NO_VALUE
            ),
        },
        {
            key: 'tabletState',
            label: 'Tablet state',
            value: (
                <Label
                    theme={tabletState === 'mounted' ? 'info' : 'default'}
                    text={format['ReadableField'](tabletState)}
                />
            ),
        },
        {
            key: 'inMemoryMode',
            label: 'In memory mode',
            value: (
                <Label
                    theme={inMemoryMode && inMemoryMode !== 'none' ? 'info' : 'default'}
                    text={format['ReadableField'](inMemoryMode || 'none')}
                />
            ),
        },
        {
            key: 'tabletErrorCount',
            label: 'Tablet error count',
            value: format['Number'](tabletErrorCount),
        },
    ];
}

export const makeMetaItems = ({
    cluster,
    attributes,
    tableType,
    isDynamic,
    mediumList = [],
    tabletErrorCount = 0,
    onEditEnableReplicatedTableTracker,
    docsUrls,
    navigationTableConfig,
}: {
    cluster: string;
    attributes: any;
    mediumList?: string[];
    isDynamic: boolean;
    tableType: string;
    tabletErrorCount?: number;
    onEditEnableReplicatedTableTracker?: (currentValue?: boolean) => Promise<void>;
    docsUrls?: Record<string, string>;
    navigationTableConfig?: Partial<TYComponentsNavigationMetaConfig>;
}) => {
    const config = navigationTableConfig
        ? {...navigationTableConfig, docsUrls: docsUrls ?? navigationTableConfig.docsUrls}
        : undefined;

    const cf = getCommonFields({
        cluster,
        attributes,
        isDynamic,
        tableType: attributes.type,
        tabletErrorCount,
        onEditEnableReplicatedTableTracker,
        config,
    });

    switch (attributes.type) {
        case CypressNodeTypes.REPLICATED_TABLE:
        case CypressNodeTypes.REPLICATION_LOG_TABLE:
            return [
                metaTablePresetMain(attributes, cluster, config),
                tableSize(attributes, isDynamic, mediumList),
                tableStorage(attributes, attributes.type, {docsUrls}),
                [
                    cf.sorted,
                    ...dynTableInfo(attributes, cluster, tabletErrorCount, config),
                    cf.automaticModeSwitch,
                ],
            ];

        case CypressNodeTypes.CHAOS_REPLICATED_TABLE:
            return [
                metaTablePresetMain(attributes, cluster, config),
                tableSize(attributes, isDynamic, mediumList),
                [
                    cf.tableType,
                    replicatedTableTracker(attributes),
                    cf.sorted,
                    cf.chaosCellBundle,
                    cf.automaticModeSwitch,
                ],
            ];

        default:
            return [
                metaTablePresetMain(attributes, cluster, config),
                tableSize(attributes, isDynamic, mediumList),
                tableStorage(attributes, tableType, {docsUrls}),
                [
                    cf.sorted,
                    ...(isDynamic
                        ? dynTableInfo(attributes, cluster, tabletErrorCount, config)
                        : []),
                ],
            ];
    }
};
