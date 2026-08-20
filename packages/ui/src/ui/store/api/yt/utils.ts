import {
    getClusterConfigByName,
    getClusterProxy,
    selectCluster,
} from '../../../store/selectors/global/cluster';
import {useSelector} from '../../../store/redux-hooks';
import {type YTEndpointApiArgs} from './types';

export function getEffectiveClusterArgs<T extends YTEndpointApiArgs<unknown>>(
    args: T,
    currentCluster: string,
): T {
    const {cluster, setup, ...rest} = args;

    const effectiveCluster = cluster ?? currentCluster;
    const effectiveSetup = effectiveCluster
        ? {proxy: getClusterProxy(getClusterConfigByName(effectiveCluster)), ...setup}
        : setup;

    return {setup: effectiveSetup, cluster: effectiveCluster, ...rest} as T;
}

export function useEffectiveClusterArgs<T extends YTEndpointApiArgs<unknown>>(args: T): T {
    const currentCluster = useSelector(selectCluster);

    return getEffectiveClusterArgs(args, currentCluster);
}
