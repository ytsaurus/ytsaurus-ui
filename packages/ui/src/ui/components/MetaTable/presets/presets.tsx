import React from 'react';
import hammer from '../../../common/hammer';
import ypath from '../../../common/thor/ypath';
import {RowsCount} from '../../../pages/navigation/content/Table/TableMeta/RowsCount/RowsCount';
import {tabletActiveBundleLink} from '../../../utils/components/tablet-cells';
import Label, {LabelOnOff} from '../../Label/Label';
import Link from '../../Link/Link';
import {Template} from '../templates/Template';
import compression from './compression';
import erasureReplication from './erasure-replication';
import size from './size';

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
            visible: Boolean(chunkCount),
        },
    ];
}

export function tableStorage(attributes: any, tableType: string) {
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
        ...erasureReplication(attributes),
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
                <Link theme={'primary'} routed url={tabletUrl}>
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
