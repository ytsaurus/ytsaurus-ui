import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectDirtySinceLastSubmit,
    selectHasLoadedQueryItem,
    selectQueryGetParams,
} from '../../../store/selectors/query-tracker/query';
import {createQueryFromTablePath, setQueryEngine} from '../../../store/actions/query-tracker/query';
import type {QueryEngine} from '../../../../shared/constants/engines';
import {toaster} from '../../../utils/toaster';
import i18n from '../QueryTrackerTopRow/QueryEngineSelector/i18n';

export function useQueryEngineChange({
    tableCluster,
    tablePath,
    onChange,
}: {
    tableCluster?: string;
    tablePath?: string;
    onChange?: (engine: QueryEngine) => void | Promise<void>;
} = {}) {
    const dispatch = useDispatch();
    const params = useSelector(selectQueryGetParams);
    const dirty = useSelector(selectDirtySinceLastSubmit);
    const loaded = useSelector(selectHasLoadedQueryItem);
    const cluster = params.cluster && params.path ? params.cluster : tableCluster;
    const path = params.cluster && params.path ? params.path : tablePath;
    const applyEngine = async (engine: QueryEngine) => {
        try {
            if (cluster && path) await dispatch(createQueryFromTablePath(engine, cluster, path));
            else dispatch(setQueryEngine(engine));
            await onChange?.(engine);
        } catch {
            toaster.add({
                name: 'query_engine_selector_change_failed',
                theme: 'danger',
                title: i18n('alert_change-engine-failed'),
            });
        }
    };
    return {showPrompt: Boolean(cluster && path && (dirty || loaded)), applyEngine};
}
