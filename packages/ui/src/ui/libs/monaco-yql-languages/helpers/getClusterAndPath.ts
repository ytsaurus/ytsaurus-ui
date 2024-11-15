import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import {getWindowStore} from '../../../store/window-store';

type Props = (
    rawPath: string,
    engine: QueryEngine,
) => {
    path: string | null;
    cluster: string | null;
};

export const getClusterAndPath: Props = (rawPath, engine) => {
    const pathMatch = [...rawPath.matchAll(/`(\/\/([^`]*))`/g)][0];
    const path = pathMatch ? pathMatch[1] : null;

    const clusterMatch = [...rawPath.matchAll(/(\w+)\./g)][0];
    let cluster = clusterMatch ? clusterMatch[1] : null;

    if (!cluster || engine === QueryEngine.SPYT) {
        const state = getWindowStore().getState();
        cluster = state.queryTracker.query?.draft.settings?.cluster || null;
    }

    return {
        path,
        cluster,
    };
};
