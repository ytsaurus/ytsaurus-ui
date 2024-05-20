import UIFactory from '../../UIFactory';
import {Page} from '../../constants';
import {TabletsTab} from '../../constants/tablets';

export function tabletCellBundleDashboardUrl(cluster: string, bundle: string) {
    return UIFactory.makeUrlForTabletCellBundleDashboard(cluster, bundle);
}

export function genTabletCellBundlesCellUrl(cellId: string, cluster?: string) {
    const prefix = cluster ? `/${cluster}/` : '';
    return `${prefix}${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}?id=${cellId}`;
}
