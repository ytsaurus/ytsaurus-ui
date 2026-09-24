import {
    getClusterConfigByName,
    getClusterProxy,
    selectCluster,
} from '../../../store/selectors/global/cluster';
import {useSelector} from '../../../store/redux-hooks';
import {type YTApiSetup} from '../../../rum/rum-wrap-api';

type ClusterArgs = {
    cluster?: string;
    setup?: YTApiSetup;
};

export function getEffectiveClusterArgs<T extends ClusterArgs>(args: T, currentCluster: string): T {
    const {cluster, setup, ...rest} = args;

    const effectiveCluster = cluster ?? currentCluster;
    const effectiveSetup = effectiveCluster
        ? {proxy: getClusterProxy(getClusterConfigByName(effectiveCluster)), ...setup}
        : setup;

    return {setup: effectiveSetup, cluster: effectiveCluster, ...rest} as T;
}

export function useEffectiveClusterArgs<T extends ClusterArgs>(args: T): T {
    const currentCluster = useSelector(selectCluster);

    return getEffectiveClusterArgs(args, currentCluster);
}
