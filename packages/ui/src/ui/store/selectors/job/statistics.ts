import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';
import {JobTree, JobTreeItem, MetricsEntry} from '../../../types/job';
import {StatisticsState} from '../../../store/reducers/job/statistics';
import {getFontFamilies} from '../settings-ts';

interface State {
    job: {
        statistics: StatisticsState;
    };
}

export const getTree = (state: State) => state.job.statistics.tree;
export const getFilter = (state: State) => state.job.statistics.filter;

const getFilteredMetricsTree = createSelector(
    [getTree, getFilter],
    (tree: Partial<JobTree>, currentFilter: string): Partial<JobTree> => {
        if (tree) {
            return hammer.treeList.filterTree(
                tree,
                (entry: MetricsEntry) => entry.name.indexOf(currentFilter) !== -1,
                true,
            );
        }

        return tree;
    },
);

const getSortedMetricsTree = createSelector(
    [getFilteredMetricsTree],
    (metricsTreeRoot: Partial<JobTree>): JobTree => {
        if (metricsTreeRoot) {
            return hammer.treeList.sortTree(
                metricsTreeRoot,
                {field: 'name', asc: true},
                {
                    name: {
                        get: function (entry: MetricsEntry) {
                            return entry.name;
                        },
                    },
                },
            );
        }

        return metricsTreeRoot;
    },
);

export const getTreeItems = createSelector(
    [getSortedMetricsTree],
    (metricTreeRoot: JobTree): JobTreeItem[] => {
        if (metricTreeRoot) {
            return hammer.treeList.flattenTree(metricTreeRoot);
        }

        return [];
    },
);

export function createCanvasContext(font: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.font = font;
    return ctx!;
}

export function mesureRowWidth(ctx: CanvasRenderingContext2D, text = '') {
    const {width} = ctx.measureText(text);
    return Math.max(1, Math.ceil(width));
}

export const LEVEL_OFFSET = 40;

export const getJobStatisticsMetricMinWidth = createSelector(
    [getTreeItems, getFontFamilies],
    (items, fontFamilies) => {
        let res = 300;
        const ctx = createCanvasContext(
            `14px / 20.02px "${fontFamilies.regular}", "Helvetica Neue", Arial, Helvetica, sans-serif`,
        );

        for (const item of items) {
            const iconsWidth = item.isLeafNode ? 20 : 20 * 2;
            const width = mesureRowWidth(ctx, item.attributes.name);
            res = Math.max(res, width + iconsWidth + item.level * LEVEL_OFFSET);
        }
        return Math.round(res * 1.05);
    },
);
