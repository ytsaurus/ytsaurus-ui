import React, {FC, useCallback, useEffect} from 'react';
import {QueryClusterSelector} from './QueryClusterSelector';
import {QueryEngine} from '../../../../shared/constants/engines';
import {QueryCliqueSelector} from './QueryCliqueSelector';
import {useDispatch, useSelector} from 'react-redux';
import {getCliqueLoading, getCliqueMap, getQueryDraft} from '../module/query/selectors';
import {getClusterList} from '../../../store/selectors/slideoutMenu';
import {loadCliqueByCluster, setUserLastChoice, updateQueryDraft} from '../module/query/actions';
import {setSettingByKey} from '../../../store/actions/settings';

export const QuerySelectorsByEngine: FC = () => {
    const dispatch = useDispatch();
    const clusters = useSelector(getClusterList);
    const cliqueMap = useSelector(getCliqueMap);
    const cliqueLoading = useSelector(getCliqueLoading);
    const {settings = {}, engine} = useSelector(getQueryDraft);
    const currentCluster = settings?.cluster;

    useEffect(() => {
        if ((engine === QueryEngine.CHYT || engine === QueryEngine.SPYT) && currentCluster) {
            dispatch(loadCliqueByCluster(engine, currentCluster));
        }
    }, [engine, currentCluster, dispatch]);

    const handleClusterChange = useCallback(
        (clusterId: string) => {
            const newSettings: Record<string, string> = settings ? {...settings} : {};
            if (clusterId) {
                newSettings.cluster = clusterId;
            } else {
                delete newSettings['cluster'];
            }
            delete newSettings['clique'];
            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(setUserLastChoice(true));
        },
        [dispatch, settings],
    );

    const handleCliqueChange = useCallback(
        (alias: string) => {
            const newSettings: Record<string, string> = settings ? {...settings} : {};
            if (!alias && 'clique' in newSettings) {
                delete newSettings.clique;
            } else {
                newSettings.clique = alias;
            }
            dispatch(updateQueryDraft({settings: newSettings}));
            dispatch(
                setSettingByKey(`local::${currentCluster}::queryTracker::lastChytClique`, alias),
            );
        },
        [currentCluster, dispatch, settings],
    );

    const handlePathChange = useCallback(
        (newPath: string) => {
            dispatch(updateQueryDraft({settings: {...settings, discovery_group: newPath}}));
            dispatch(
                setSettingByKey(
                    `local::${currentCluster}::queryTracker::lastDiscoveryPath`,
                    newPath,
                ),
            );
        },
        [currentCluster, dispatch, settings],
    );

    const clusterCliqueList =
        settings.cluster && settings.cluster in cliqueMap ? cliqueMap[settings.cluster] : {};
    const cliqueList = engine in clusterCliqueList ? clusterCliqueList[engine] : [];

    if (engine === QueryEngine.CHYT) {
        return (
            <>
                <QueryClusterSelector
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
            clusters={clusters}
            value={settings.cluster}
            onChange={handleClusterChange}
        />
    );
};
