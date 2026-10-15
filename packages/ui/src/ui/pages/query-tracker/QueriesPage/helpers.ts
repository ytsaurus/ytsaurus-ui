import type {QueryStatus as KitQueryStatus, QueryEditorProps} from '@gravity-ui/querieskit';
import {QueryEngine} from '../../../../shared/constants/engines';
import {ProgressStatuses, QueryStatus} from '../../../types/query-tracker';

export function getQueryStatus(status?: QueryStatus): KitQueryStatus {
    if (!status || status === QueryStatus.DRAFT) return 'draft';
    if (ProgressStatuses.includes(status)) return 'running';
    if (status === QueryStatus.COMPLETED) return 'completed';
    if (status === QueryStatus.ABORTED) return 'aborted';
    return 'failed';
}

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
