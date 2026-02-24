import {Page, TabletsTab} from '../../../../constants';

export function tabletActiveChaosBundleLink(cluster: string, bundle: string) {
    return `/${cluster}/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}?activeBundle=${bundle}`;
}
