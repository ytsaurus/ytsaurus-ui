import {useEffect} from 'react';
import {
    type BuiltinEngineSettings,
    createBuiltinQueryEngines,
} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import type {QueryEditorEngineSettingsContext} from '@gravity-ui/querieskit';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectCliqueLoading,
    selectCliqueMap,
    selectQueryDraft,
} from '../../../../store/selectors/query-tracker/query';
import {
    selectAvailableYql,
    selectEffectiveYqlVersion,
} from '../../../../store/selectors/query-tracker/queryAco';
import {
    selectAvailableSpytConnect,
    selectQueryTrackerInfoLoaded,
} from '../../../../store/selectors/query-tracker/queryTrackerEnginesInfo';
import {
    loadCliqueByCluster,
    setQueryClique,
    setQueryPath,
    setQueryYqlVersion,
    updateQueryDraft,
} from '../../../../store/actions/query-tracker/query';
import {QueryEngine} from '../../../../../shared/constants/engines';

export function useBuiltinEngineSettings() {
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
        if (
            cluster &&
            (engine === QueryEngine.CHYT ||
                (engine === QueryEngine.SPYT && infoLoaded && !connectAvailable))
        ) {
            dispatch(loadCliqueByCluster(engine, cluster));
        }
    }, [dispatch, engine, cluster, infoLoaded, connectAvailable]);

    const cliques = cluster ? cliqueMap[cluster]?.[engine] : undefined;
    const [preset] = createBuiltinQueryEngines({
        engines: [engine],
        yql: {versions},
        chyt: {
            loading,
            cliques: cliques?.map(({alias, yt_operation_id, state, health}) => ({
                alias,
                operationId: yt_operation_id,
                state,
                health,
            })),
        },
        spyt: {
            loading,
            connectAvailable,
            discoveryGroups: cliques?.map(({alias}) => ({path: alias})),
        },
    });
    const custom: BuiltinEngineSettings = {
        yqlVersion,
        clique: settings.clique,
        discoveryGroup: settings.discovery_group,
        spytConfig: JSON.stringify(settings, null, 2),
    };
    const context: QueryEditorEngineSettingsContext<BuiltinEngineSettings> = {
        engineId: engine,
        clusterId: cluster,
        disabled: false,
        value: {
            queryName: '',
            access: 'private',
            ytOperationTitle: '',
            tokenIds: [],
            attributes: [],
            custom,
        },
        onChange: ({custom: next}) => {
            if (engine === QueryEngine.YQL && next.yqlVersion !== custom.yqlVersion) {
                dispatch(setQueryYqlVersion(next.yqlVersion ?? ''));
            }
            if (engine === QueryEngine.CHYT && next.clique !== custom.clique) {
                dispatch(setQueryClique(next.clique ?? ''));
            }
            if (engine === QueryEngine.SPYT) {
                if (connectAvailable && next.spytConfig !== custom.spytConfig) {
                    // The native editor emits only validated JSON objects on Save.
                    dispatch(updateQueryDraft({settings: JSON.parse(next.spytConfig || '{}')}));
                } else if (!connectAvailable && next.discoveryGroup !== custom.discoveryGroup) {
                    dispatch(setQueryPath(next.discoveryGroup ?? ''));
                }
            }
        },
    };
    return {preset, context};
}
