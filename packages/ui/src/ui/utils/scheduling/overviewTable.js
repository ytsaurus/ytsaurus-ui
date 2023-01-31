import React from 'react';
import SchedulingOperationsLoader from '../../pages/scheduling/Content/tabs/ScherdulingOperataionsLoader/SchedulingOperationsLoader';

export const poolsTableItems = {
    type: {
        caption: '',
        align: 'center',
    },
    name: {
        sort: true,
        caption: 'Pool / Operation',
        captionTail: <SchedulingOperationsLoader />,
        align: 'left',
        get(item) {
            return item.name;
        },
    },
    mode: {
        sort: true,
        align: 'center',
        get(item) {
            return item.mode;
        },
    },
    FI: {
        sort: true,
        align: 'right',
        title: 'FIFO Index',
        get(item) {
            return item.fifoIndex;
        },
    },
    weight: {
        sort: true,
        align: 'right',
        title: 'Effective weight',
        get(item) {
            return item.weight;
        },
    },
    operation_overview: {
        caption: 'Operations',
        sort: true,
        align: 'center',
        get(item) {
            return [item.operationCount, item.runningOperationCount];
        },
    },
    dominant_resource: {
        sort(item) {
            return item.dominantResource;
        },
        caption: 'Dom. res.',
        title: 'Dominant Resource',
        align: 'left',
    },
    min_share: {
        caption: 'Guarantee',
        title: 'Effective dominant strong guarantee share',
        sort(item) {
            return item.minShareRatio;
        },
        align: 'right',
    },
    fair_share: {
        sort: true,
        title: 'Dominant fair share',
        align: 'right',
        get(item) {
            return item.fairShareRatio;
        },
    },
    usage: {
        sort: true,
        title: 'Dominant usage share',
        align: 'right',
        get(item) {
            return item.usageRatio;
        },
    },
    demand: {
        sort: true,
        title: 'Dominant demand share',
        align: 'right',
        get(item) {
            return item.demandRatio;
        },
    },
    fair_share_usage: {
        sort: true,
        caption: 'Usage / Fair share',
        align: 'center',
        sortWithUndefined: true,
        get(item) {
            const {fairShareRatio, usageRatio} = item;
            const x = Number(usageRatio) / Number(fairShareRatio);
            if (isNaN(usageRatio) || isNaN(fairShareRatio) || isNaN(x)) {
                return undefined;
            }
            return x;
        },
    },
    actions: {
        caption: '',
        align: 'left',
    },
};
