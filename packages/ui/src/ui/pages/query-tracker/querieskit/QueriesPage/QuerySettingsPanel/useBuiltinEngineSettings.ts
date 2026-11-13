import {
    type BuiltinEngineSettings,
    type BuiltinEngineSettingsBinding,
    type BuiltinQueryEnginesOptions,
    createBuiltinQueryEngines,
} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import {QueryEngine} from '../../../../../../shared/constants/engines';
import {useQueryEngineSettings} from '../../../hooks/useQueryEngineSettings';

export function useBuiltinEngineSettings(engineIds: QueryEngine[]) {
    const {
        engine,
        settings,
        loading,
        versions,
        yqlVersion,
        connectAvailable,
        cliques,
        clique,
        changeClique,
        changeDiscoveryGroup,
        changeYqlVersion,
        changeSettings,
    } = useQueryEngineSettings();
    const options: BuiltinQueryEnginesOptions = {
        engines: engineIds,
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
    };
    const engines = createBuiltinQueryEngines<BuiltinEngineSettings, unknown>(options);
    const value: BuiltinEngineSettings = {
        yqlVersion,
        clique,
        discoveryGroup: settings.discovery_group,
        spytConfig: JSON.stringify(settings, null, 2),
    };
    const onChange: BuiltinEngineSettingsBinding['onChange'] = (next, field) => {
        if (engine === QueryEngine.YQL && field === 'yqlVersion') {
            changeYqlVersion(next.yqlVersion ?? '');
        }
        if (engine === QueryEngine.CHYT && field === 'clique') {
            changeClique(next.clique ?? '');
        }
        if (engine === QueryEngine.SPYT) {
            if (connectAvailable && field === 'spytConfig') {
                changeSettings(JSON.parse(next.spytConfig || '{}'));
            } else if (!connectAvailable && field === 'discoveryGroup') {
                changeDiscoveryGroup(next.discoveryGroup ?? '');
            }
        }
    };
    return {engines, options, binding: {value, onChange, clusterId: settings.cluster}};
}
