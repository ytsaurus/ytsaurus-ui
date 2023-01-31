import React from 'react';

import type {Column} from '@yandex-cloud/react-data-table';

import type {YTConfig} from '../../../../../../shared/yt-types';
import hammer from '../../../../../common/hammer';
import {TABLET_SLOTS} from '../../../../../components/templates/components/nodes/nodes';
import DataTableYT from '../../../../../components/DataTableYT/DataTableYT';
import Link from '../../../../../components/Link/Link';
import StatusBlock from '../../../../../components/StatusBlock/StatusBlock';
import {genTabletCellBundlesCellUrl} from '../../../../../utils/tablet_cell_bundles';

const YT = (window as any).YT as YTConfig;

type TabletSlot = any;

interface TabletSlotsProps {
    tabletSlots: TabletSlot[];
}

const columns: Array<Column<TabletSlot>> = [
    {
        name: 'Cell ID',
        render({row}) {
            const url = genTabletCellBundlesCellUrl(row.cell_id, YT.cluster);

            return row.cell_id ? (
                <Link url={url} theme="ghost" routed>
                    {row.cell_id}
                </Link>
            ) : (
                hammer.format.NO_VALUE
            );
        },
    },
    {
        name: 'Peer ID',
        render({row}) {
            return row.peer_id;
        },
    },
    {
        name: 'State',
        render({row}) {
            const {text, theme} = TABLET_SLOTS[row.state as keyof typeof TABLET_SLOTS];

            return row.state ? <StatusBlock theme={theme} text={text} /> : hammer.format.NO_VALUE;
        },
    },
];

function NodeTabletSlots({tabletSlots}: TabletSlotsProps): ReturnType<React.VFC> {
    return (
        <DataTableYT
            columns={columns}
            data={tabletSlots}
            startIndex={1}
            useThemeYT
            settings={{sortable: false}}
        />
    );
}

export default React.memo(NodeTabletSlots);
