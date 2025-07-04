import React, {FC, useCallback, useEffect} from 'react';
import {QueryClusterSelector} from './QueryClusterSelector';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useDispatch, useSelector} from 'react-redux';
import {
    getCliqueLoading,
    getCliqueMap,
    getClusterLoading,
    getQueryDraft,
} from '../module/query/selectors';
import {getClusterList} from '../../../store/selectors/slideoutMenu';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryCluster,
    setQueryPath,
} from '../module/query/actions';

export const QuerySelectorsByEngine: FC = () => {
    const dispatch = useDispatch();
    const clusters = useSelector(getClusterList);
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const clusterLoading = useSelector(getClusterLoading);
    const {settings = {}, engine} = useSelector(getQueryDraft);
    const currentCluster = settings?.cluster;

    useEffect(() => {
        if ((engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) && currentCluster) {
            dispatch(loadCliqueByCluster(engine, currentCluster));
        }
    }, [engine, currentCluster, dispatch]);

    const handleClusterChange = useCallback(
        (clusterId: string) => {
            dispatch(setQueryCluster(clusterId));
        },
        [dispatch],
    );

    const handleCliqueChange = useCallback(
        (alias: string) => {
            dispatch(setQueryClique(alias));
        },
        [dispatch],
    );

    const handlePathChange = useCallback(
        (newPath: string) => {
            dispatch(setQueryPath(newPath));
        },
        [dispatch],
    );

    const clusterCliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : {};
    const cliqueList = engine in clusterCliqueList ? clusterCliqueList[engine] : [];

    if (engine === QueryEngine.CHYT) {
        return (
            <>
                <QueryClusterSelector
                    loading={clusterLoading}
                    clusters={clusters}
                    value={settings.cluster}
                    onChange={handleClusterChange}
                />
                <QueryCliqueSelector
                    loading={cliqueLoading}
                    cliqueList={cliqueList}
                    value={settings.clique}
                    onChange={handleCliqueChange}
                    showStatus
                />
            </>
        );
    }

    if (engine === QueryEngine.SPYT) {
        return (
            <>
                <QueryClusterSelector
                    loading={clusterLoading}
                    clusters={clusters}
                    value={settings.cluster}
                    onChange={handleClusterChange}
                />
                <QueryCliqueSelector
                    placeholder="Discovery path"
                    loading={cliqueLoading}
                    cliqueList={cliqueList}
                    value={settings.discovery_group}
                    onChange={handlePathChange}
                />
            </>
        );
    }

    return (
        <QueryClusterSelector
            loading={clusterLoading}
            clusters={clusters}
            value={settings.cluster}
            onChange={handleClusterChange}
        />
    );
};
