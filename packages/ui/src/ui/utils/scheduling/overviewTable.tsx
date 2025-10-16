import React from 'react';

import SchedulingOperationsLoader from '../../pages/scheduling/Content/tabs/ScherdulingOperataionsLoader/SchedulingOperationsLoader';
import {PoolOrOperation} from '../../utils/scheduling/pool-child';

import {ColumnInfo} from '../../components/ElementsTable/ElementsTableHeader';

type ItemType = PoolOrOperation<'pool' | 'operation'>;

export const poolsTableItems: Record<
    string,
    Omit<ColumnInfo, 'caption'> & {
        get(item: ItemType): React.ReactNode;
        caption?: string;
    }
> = {
    name: {
        sort: true,
        caption: 'Pool / Operation',
        captionTail: <SchedulingOperationsLoader />,
        align: 'left',
        get(item: ItemType) {
            if (item.type === 'pool') {
                return item.name;
            }
            return item.attributes.title ?? item.name;
        },
    },
    FI: {
        sort: true,
        align: 'right',
        title: 'FIFO Index',
        get(item: ItemType) {
            return item.fifoIndex;
        },
    },
    weight: {
        sort: true,
        align: 'right',
        title: 'Effective weight',
        get(item: ItemType) {
            return item.weight;
        },
    },
    operation_overview: {
        caption: 'Operations',
        sort: true,
        align: 'center',
        get(item: ItemType) {
            return [item.operationCount, item.runningOperationCount];
        },
    },
    dominant_resource: {
        sort: true,
        get(item: ItemType) {
            return item.dominantResource;
        },
        caption: 'Dom. res.',
        title: 'Dominant Resource',
        align: 'left',
    },
    min_share: {
        sort: true,
        caption: 'Guarantee',
        title: 'Effective dominant strong guarantee share',
        get(item: ItemType) {
            return item.minShareRatio;
        },
        align: 'right',
    },
    fair_share: {
        sort: true,
        title: 'Dominant fair share',
        align: 'right',
        get(item: ItemType) {
            return item.fairShareRatio;
        },
    },
    usage: {
        sort: true,
        title: 'Dominant usage share',
        align: 'right',
        get(item: ItemType) {
            return item.usageRatio;
        },
    },
    demand: {
        sort: true,
        title: 'Dominant demand share',
        align: 'right',
        get(item: ItemType) {
            return item.demandRatio;
        },
    },
    fair_share_usage: {
        sort: true,
        caption: 'Usage / Fair share',
        align: 'center',
        sortWithUndefined: true,
        get(item: ItemType) {
            const {fairShareRatio, usageRatio} = item;
            const x = Number(usageRatio) / Number(fairShareRatio);
            if (isNaN(usageRatio!) || isNaN(fairShareRatio!) || isNaN(x)) {
                return undefined;
            }
            return x;
        },
    },
    user: {
        sort: true,
        title: 'User',
        align: 'left',
        get(item: ItemType) {
            return item.attributes.user;
        },
    },
    operation_type: {
        sort: true,
        title: 'Type',
        caption: 'Type',
        align: 'left',
        get(item: ItemType) {
            return item.attributes.type;
        },
    },
    actions: {
        caption: '',
        title: 'Actions',
        align: 'left',
        get() {
            return undefined;
        },
    },
};

export function getOverviewColumnTitle(name: string) {
    const {title, caption} = poolsTableItems[name] ?? {};
    return title ?? caption ?? `##${name}##`;
}

export const OVERVIEW_AVAILABLE_COLUMNS = Object.keys(poolsTableItems) as Array<string>;
