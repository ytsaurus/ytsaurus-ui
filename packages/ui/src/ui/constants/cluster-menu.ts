export const DEFAULT_GROUP = 'other';

export const CLUSTER_GROUPS: Record<string, {caption: string; size?: 'l'}> = {
    /** !!! the order is important !!! **/

    'primary-mrs': {
        size: 'l',
        caption: 'Primary MRs',
    },
    'auxiliary-mrs': {
        caption: 'Auxiliary MRs',
    },
    GPU: {
        caption: 'GPU',
    },
    'dynamic-tables': {
        caption: 'Dynamic Tables',
    },
    'chaos-coordinator': {
        caption: 'Chaos Coordinators',
    },
    infrastructural: {
        caption: 'Infrastructural',
    },
    ofd: {
        caption: 'OFD',
    },
    yp: {
        caption: 'YP',
    },
    /**
     * "recent" & "other" are pseudo groups and items for them are calculated dynamically
     */
    recent: {
        caption: 'Recent',
    },
    [DEFAULT_GROUP]: {
        caption: 'Other',
    },
};

export const CLUSTER_GROUPS_ORDER = Object.keys(CLUSTER_GROUPS);
