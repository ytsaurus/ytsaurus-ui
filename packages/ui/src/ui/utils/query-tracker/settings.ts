import {QueryEngine} from '../../../shared/constants/engines';
import type {ClusterConfig} from '../../../shared/yt-types';

export function shouldLoadQueryCliques(
    engine: QueryEngine,
    infoLoaded: boolean,
    spytConnect: boolean,
): engine is QueryEngine.CHYT | QueryEngine.SPYT {
    return (
        engine === QueryEngine.CHYT || (engine === QueryEngine.SPYT && infoLoaded && !spytConnect)
    );
}

export function getQueryClusters(
    clusters: Pick<ClusterConfig, 'id' | 'name' | 'environment'>[],
    allowed: string[] | undefined,
    local: boolean,
    current?: string,
): Pick<ClusterConfig, 'id' | 'name' | 'environment'>[] {
    const available: Pick<ClusterConfig, 'id' | 'name' | 'environment'>[] =
        local && allowed?.length
            ? allowed.map((id) => ({id, name: id, environment: 'localmode'}))
            : clusters.filter(({id}) => !allowed?.length || allowed.includes(id));
    if (current && !available.some(({id}) => id === current)) {
        return [...available, {id: current, name: current, environment: 'localmode'}];
    }
    return available;
}

export function getQuerySettingPermissions(key: string) {
    const editable = key !== 'cluster' && key !== 'clique';
    return {canEditKey: editable, canEditValue: editable, canRemove: key !== 'cluster'};
}
