import React from 'react';

import {SchedulingOverviewColumnNames} from '../../../shared/constants/settings-types';

import SchedulingOperationsLoader from '../../pages/scheduling/Content/tabs/ScherdulingOperataionsLoader/SchedulingOperationsLoader';
import {PoolInfo} from '../../store/selectors/scheduling/scheduling-pools';
import {ColumnInfo} from '../../components/ElementsTable/ElementsTableHeader';

export const poolsTableItems: Record<
    SchedulingOverviewColumnNames,
    Omit<ColumnInfo, 'caption'> & {get(item: PoolInfo): React.ReactNode; caption?: string}
> = {
    name: {
        sort: true,
        caption: 'Pool / Operation',
        captionTail: <SchedulingOperationsLoader />,
        align: 'left',
        get(item: PoolInfo) {
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
        get(item: PoolInfo) {
            return item.fifoIndex;
        },
    },
    weight: {
        sort: true,
        align: 'right',
        title: 'Effective weight',
        get(item: PoolInfo) {
            return item.weight;
        },
    },
    operation_overview: {
        caption: 'Operations',
        sort: true,
        align: 'center',
        get(item: PoolInfo) {
            return [item.operationCount, item.runningOperationCount];
        },
    },
    dominant_resource: {
        sort: true,
        get(item: PoolInfo) {
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
        get(item: PoolInfo) {
            return item.minShareRatio;
        },
        align: 'right',
    },
    fair_share: {
        sort: true,
        title: 'Dominant fair share',
        align: 'right',
        get(item: PoolInfo) {
            return item.fairShareRatio;
        },
    },
    usage: {
        sort: true,
        title: 'Dominant usage share',
        align: 'right',
        get(item: PoolInfo) {
            return item.usageRatio;
        },
    },
    demand: {
        sort: true,
        title: 'Dominant demand share',
        align: 'right',
        get(item: PoolInfo) {
            return item.demandRatio;
        },
    },
    fair_share_usage: {
        sort: true,
        caption: 'Usage / Fair share',
        align: 'center',
        sortWithUndefined: true,
        get(item: PoolInfo) {
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
        get(item: PoolInfo) {
            return item.attributes.user;
        },
    },
    operation_type: {
        sort: true,
        title: 'Type',
        caption: 'Type',
        align: 'left',
        get(item: PoolInfo) {
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

export function getOverviewColumnTitle(name: SchedulingOverviewColumnNames) {
    const {title, caption} = poolsTableItems[name] ?? {};
    return title ?? caption ?? `##${name}##`;
}

export const OVERVIEW_AVAILABLE_COLUMNS = Object.keys(
    poolsTableItems,
) as Array<SchedulingOverviewColumnNames>;
