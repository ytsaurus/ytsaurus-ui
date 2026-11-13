import {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectClusterLoading,
    selectIsQueryButtonActive,
    selectIsQueryLoading,
    selectQueryEngine,
    selectQuerySubmitting,
} from '../../../store/selectors/query-tracker/query';
import {runQuery} from '../../../store/actions/query-tracker/query';
import {QueryEngine} from '../../../../shared/constants/engines';

type Options = {
    onStartQuery?: (id: string) => boolean | void;
    active?: boolean;
};

export function useQueryCommands({onStartQuery, active = true}: Options) {
    const dispatch = useDispatch();
    const canRun = useSelector(selectIsQueryButtonActive);
    const loading = useSelector(selectIsQueryLoading);
    const clusterLoading = useSelector(selectClusterLoading);
    const submitting = useSelector(selectQuerySubmitting);
    const engine = useSelector(selectQueryEngine);
    const disabled = !active || !canRun || loading || clusterLoading || submitting;
    const execute = useCallback(
        async (mode?: 'validate' | 'optimize') => {
            if (disabled || (mode && engine !== QueryEngine.YQL)) return;
            try {
                await dispatch(runQuery(onStartQuery, mode ? {execution_mode: mode} : undefined));
            } catch {
                // runQuery reports the error and restores dirty state.
            }
        },
        [disabled, engine, dispatch, onStartQuery],
    );
    const run = useCallback(() => execute(), [execute]);
    const validate = useCallback(() => execute('validate'), [execute]);
    const explain = useCallback(() => execute('optimize'), [execute]);
    return {disabled, submitting, run, validate, explain};
}
