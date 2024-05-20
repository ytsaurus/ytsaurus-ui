import UIFactory from '../../UIFactory';
import {Page} from '../../constants';
import {TabletsTab} from '../../constants/tablets';
import {OrderType, multiSortWithUndefined, orderTypeToOrderK} from '../sort-helpers';

export function tabletCellBundleDashboardUrl(cluster: string, bundle: string) {
    return UIFactory.makeUrlForTabletCellBundleDashboard(cluster, bundle);
}

export function genTabletCellBundlesCellUrl(cellId: string, cluster?: string) {
    const prefix = cluster ? `/${cluster}/` : '';
    return `${prefix}${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}?id=${cellId}`;
}

function compareBundlesByAccount<T extends Record<string, any>>(left: T, right: T) {
    if (
        left.changelog_account === right.changelog_account &&
        left.snapshot_account === right.snapshot_account
    ) {
        return 0;
    }

    return left.changelog_account < right.changelog_account
        ? -1
        : left.snapshot_account < right.snapshot_account
        ? -1
        : 1;
}

export const sortTableBundles = <T extends Record<string, any>>({
    bundles,
    column,
    columnsSortable,
    order,
}: {
    bundles: T[];
    column: keyof T;
    columnsSortable: Set<string>;
    order: OrderType;
}) => {
    let sorted: T[] = [];

    const {orderK, undefinedOrderK} = orderTypeToOrderK(order);

    if (column === 'changelog_account') {
        sorted = [...bundles].sort(compareBundlesByAccount);
    } else if (column === 'nodes') {
        sorted = [...bundles].sort(({nodes: l = []}, {nodes: r = []}) => l.length - r.length);
    } else if (columnsSortable.has(column as string)) {
        return multiSortWithUndefined(bundles, [{key: column, orderK, undefinedOrderK}]);
    }

    return (order as string).includes('asc') ? sorted : sorted.reverse();
};
