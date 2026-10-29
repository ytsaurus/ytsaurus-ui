import {
    type BuiltinEngineSettings,
    createBuiltinQueryEngines,
} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import type {QuerySettingsProps} from '@gravity-ui/querieskit';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {useQueryEngineSettings} from '../../hooks/useQueryEngineSettings';

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
    const engines = createBuiltinQueryEngines<BuiltinEngineSettings, unknown>({
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
    });
    const custom: BuiltinEngineSettings = {
        yqlVersion,
        clique,
        discoveryGroup: settings.discovery_group,
        spytConfig: JSON.stringify(settings, null, 2),
    };
    const onChange: QuerySettingsProps<BuiltinEngineSettings, unknown>['onChange'] = (
        {custom: next},
        change,
    ) => {
        const changed = (field: keyof BuiltinEngineSettings) =>
            change
                ? change.changes.some((item) => item.section === 'custom' && item.field === field)
                : next[field] !== custom[field];
        if (engine === QueryEngine.YQL && changed('yqlVersion')) {
            changeYqlVersion(next.yqlVersion ?? '');
        }
        if (engine === QueryEngine.CHYT && changed('clique')) {
            changeClique(next.clique ?? '');
        }
        if (engine === QueryEngine.SPYT) {
            if (connectAvailable && changed('spytConfig')) {
                changeSettings(JSON.parse(next.spytConfig || '{}'));
            } else if (!connectAvailable && changed('discoveryGroup')) {
                changeDiscoveryGroup(next.discoveryGroup ?? '');
            }
        }
    };
    return {engines, custom, onChange};
}
