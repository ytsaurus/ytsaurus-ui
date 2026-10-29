import type {QueryEditorProps} from '@gravity-ui/querieskit';
import {QueryEngine} from '../../../../shared/constants/engines';

export function getEditorActions(
    engine: QueryEngine,
    disabled: boolean,
    loading: boolean,
): Pick<QueryEditorProps, 'hiddenActions' | 'hiddenPanels' | 'actionStates'> {
    return {
        hiddenActions: engine === QueryEngine.YQL ? ['format'] : ['format', 'validate'],
        hiddenPanels: ['parameters'],
        actionStates: {
            run: {disabled, loading},
            validate: {disabled, loading},
        },
    };
}

export function isRunDisabled({
    canRun,
    loading,
    clusterLoading,
    submitting,
}: {
    canRun: boolean;
    loading: boolean;
    clusterLoading: boolean;
    submitting: boolean;
}) {
    return !canRun || loading || clusterLoading || submitting;
}
