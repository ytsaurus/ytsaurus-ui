import {Page, TabletsTab} from '../../../../constants';

export function tabletActiveBundleLink(
    cluster: string,
    bundle: string,
    enableBundleController?: boolean,
) {
    const tabletTab = enableBundleController ? TabletsTab.INSTANCES : TabletsTab.TABLET_CELLS;
    return `/${cluster}/${Page.TABLET_CELL_BUNDLES}/${tabletTab}?activeBundle=${bundle}`;
}
