import {useEffect} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectCliqueLoading,
    selectCliqueMap,
    selectQueryDraft,
} from '../../../store/selectors/query-tracker/query';
import {
    selectAvailableYql,
    selectEffectiveYqlVersion,
} from '../../../store/selectors/query-tracker/queryAco';
import {
    selectAvailableSpytConnect,
    selectQueryTrackerInfoLoaded,
} from '../../../store/selectors/query-tracker/queryTrackerEnginesInfo';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryPath,
    setQueryYqlVersion,
    updateQueryDraft,
} from '../../../store/actions/query-tracker/query';
import {shouldLoadQueryCliques} from '../../../utils/query-tracker/settings';
import type {DraftQuery} from '../../../types/query-tracker/api';

export function useQueryEngineSettings() {
    const dispatch = useDispatch();
    const {engine, settings = {}} = useSelector(selectQueryDraft);
    const cliqueMap = useSelector(selectCliqueMap);
    const loading = useSelector(selectCliqueLoading);
    const versions = useSelector(selectAvailableYql);
    const yqlVersion = useSelector(selectEffectiveYqlVersion);
    const connectAvailable = useSelector(selectAvailableSpytConnect);
    const infoLoaded = useSelector(selectQueryTrackerInfoLoaded);
    const cluster = settings.cluster;
    useEffect(() => {
        if (cluster && shouldLoadQueryCliques(engine, infoLoaded, connectAvailable)) {
            dispatch(loadCliqueByCluster(engine, cluster));
        }
    }, [dispatch, engine, cluster, infoLoaded, connectAvailable]);
    const cliques = cluster ? cliqueMap[cluster]?.[engine] : undefined;
    const clique =
        !loading && cliques && !cliques.some(({alias}) => alias === settings.clique)
            ? undefined
            : settings.clique;
    return {
        engine,
        settings,
        loading,
        versions,
        yqlVersion,
        connectAvailable,
        cliques,
        clique,
        changeClique: (alias: string) => dispatch(setQueryClique(alias)),
        changeDiscoveryGroup: (path: string) => dispatch(setQueryPath(path)),
        changeYqlVersion: (version: string) => dispatch(setQueryYqlVersion(version)),
        changeSettings: (next: DraftQuery['settings']) =>
            dispatch(updateQueryDraft({settings: next})),
    };
}
