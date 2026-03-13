import {hammer, ypath} from '../../../utils';
import {Label, LabelOnOff} from '../../Label';
import {Link} from '@gravity-ui/uikit';
import {Template} from '../templates/Template';
import compression from './compression';
import erasureReplication from './erasure-replication';
import size from './size';
import {main} from './index';
import {getCommonFields} from './helpers/commonFields';
import type {YtComponentsConfig} from '../../../context';

import i18n from './i18n';
import {CypressNodeTypes} from '../../../types';
import {RowsCount} from '../templates/RowsCount/RowsCount';
import {tabletActiveBundleLink} from './helpers/tabletActiveBundleLink';

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
            visible: Boolean(rowCount),
        },
        {
            key: 'chunkCount',
            label: 'Chunks',
            value: hammer.format['Number'](chunkCount),
            visible: Boolean(dataWeight),
        },
        ...size(attributes, mediumList),
        {
            key: 'dataWeight',
            label: 'Data weight',
            value: <Template.FormattedValue value={dataWeight} format="Bytes" />,
            tooltip: i18n('data_weight:tooltip'),
            visible: Boolean(chunkCount),
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
            value: <Label text={hammer.format['ReadableField'](optimizeFor)} theme="info" />,
            visible: optimizeFor !== 'undefined',
        },
        ...compression(attributes),
        ...erasureReplication(attributes, options),
        replicatedTableTracker(attributes),
    ];
}

export function dynTableInfo(attributes: any, cluster: string, tabletErrorCount: number) {
    const [tabletCellBundle, tabletState, inMemoryMode] = ypath.getValues(attributes, [
        '/tablet_cell_bundle',
        '/tablet_state',
        '/in_memory_mode',
    ]);

    const tabletUrl = tabletActiveBundleLink(cluster, tabletCellBundle);
    return [
        {
            key: 'tabletCellBundle',
            label: 'Tablet cell bundle',
            value: (
                <Link view={'primary'} href={tabletUrl}>
                    {tabletCellBundle}
                </Link>
            ),
        },
        {
            key: 'tabletState',
            label: 'Tablet state',
            value: (
                <Label
                    theme={tabletState === 'mounted' ? 'info' : 'default'}
                    text={hammer.format['ReadableField'](tabletState)}
                />
            ),
        },
        {
            key: 'inMemoryMode',
            label: 'In memory mode',
            value: (
                <Label
                    theme={inMemoryMode && inMemoryMode !== 'none' ? 'info' : 'default'}
                    text={hammer.format['ReadableField'](inMemoryMode || 'none')}
                />
            ),
        },
        {
            key: 'tabletErrorCount',
            label: 'Tablet error count',
            value: hammer.format['Number'](tabletErrorCount),
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
    /** Optional config (SubjectCard, renderYqlOperationLink, docsUrls). Pass to avoid using hooks when calling from non-React code (e.g. Redux thunk). */
    navigationTableConfig?: Partial<YtComponentsConfig>;
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
    });

    switch (attributes.type) {
        case CypressNodeTypes.REPLICATED_TABLE:
        case CypressNodeTypes.REPLICATION_LOG_TABLE:
            return [
                main(attributes, cluster, config),
                tableSize(attributes, isDynamic, mediumList),
                tableStorage(attributes, attributes.type, {docsUrls}),
                [
                    cf.sorted,
                    ...dynTableInfo(attributes, cluster, tabletErrorCount),
                    cf.automaticModeSwitch,
                ],
            ];

        case CypressNodeTypes.CHAOS_REPLICATED_TABLE:
            return [
                main(attributes, cluster, config),
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
                main(attributes, cluster, config),
                tableSize(attributes, isDynamic, mediumList),
                tableStorage(attributes, tableType, {docsUrls}),
                [
                    cf.sorted,
                    ...(isDynamic ? dynTableInfo(attributes, cluster, tabletErrorCount) : []),
                ],
            ];
    }
};
