import {useCallback, useEffect, useRef} from 'react';
import {useStore} from 'react-redux';
import type {RootState} from '../../../store/reducers';
import {useUpdater} from '../../../hooks/use-updater';
import {QUERY_POLLING_INTERVAL} from '../../../constants/queries';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectQueriesListMode,
    selectQueriesListTabs,
} from '../../../store/selectors/query-tracker/queriesList';
import {DefaultQueriesListFilter, QueriesListMode} from '../../../types/query-tracker/queryList';
import {
    applyListMode,
    refreshQueriesList,
    resetQueryList,
} from '../../../store/actions/query-tracker/queriesList';
import {setFilter} from '../../../store/reducers/query-tracker/queryListSlice';
import i18n from './i18n';

export function getQueriesListTabName(mode: QueriesListMode): string {
    const names: Record<QueriesListMode, string> = {
        [QueriesListMode.History]: i18n('tab_history'),
        [QueriesListMode.Tutorials]: i18n('tab_tutorials'),
        [QueriesListMode.VCS]: i18n('tab_vcs'),
        [QueriesListMode.Navigation]: i18n('tab_navigation'),
    };
    return names[mode];
}

export function useQueriesListInitialization() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const activeTab = useSelector(selectQueriesListMode);
    const tabs = useSelector(selectQueriesListTabs);
    const initializedCluster = useRef<string>();
    const store = useStore<RootState>();
    const refresh = useCallback(() => {
        const {list} = store.getState().queryTracker;
        if (list.listMode === QueriesListMode.History && !list.isLoading) {
            return dispatch(refreshQueriesList());
        }
        return undefined;
    }, [dispatch, store]);

    useEffect(() => {
        if (!tabs.includes(activeTab)) {
            if (tabs[0]) {
                initializedCluster.current = cluster;
                dispatch(applyListMode(tabs[0]));
            }
            return;
        }
        if (initializedCluster.current !== cluster) {
            initializedCluster.current = cluster;
            dispatch(setFilter(DefaultQueriesListFilter[activeTab]));
            dispatch(resetQueryList());
        }
    }, [dispatch, cluster, activeTab, tabs]);
    useUpdater(refresh, {timeout: QUERY_POLLING_INTERVAL});
}

export function useQueriesListState() {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectQueriesListMode);
    const tabsList = useSelector(selectQueriesListTabs);
    const onTabChange = (id: string) => {
        const next = tabsList.find((tab) => tab === id);
        if (next && next !== activeTab) dispatch(applyListMode(next));
    };
    return {activeTab, tabsList, onTabChange};
}
