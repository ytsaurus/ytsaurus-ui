import React, {useEffect, useRef} from 'react';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectQueriesListMode,
    selectQueriesListTabs,
} from '../../../store/selectors/query-tracker/queriesList';
import {DefaultQueriesListFilter, QueriesListMode} from '../../../types/query-tracker/queryList';
import {applyListMode, resetQueryList} from '../../../store/actions/query-tracker/queriesList';
import {setFilter} from '../../../store/reducers/query-tracker/queryListSlice';
import {LegacyQueriesList} from './LegacyQueriesList';
import i18n from './i18n';
import './index.scss';
const b = block('queries-list');
function getTabName(mode: QueriesListMode): string {
    const TabNames: Record<QueriesListMode, string> = {
        [QueriesListMode.History]: i18n('tab_history'),
        [QueriesListMode.Tutorials]: i18n('tab_tutorials'),
        [QueriesListMode.VCS]: i18n('tab_vcs'),
        [QueriesListMode.Navigation]: i18n('tab_navigation'),
    };

    return TabNames[mode];
}

export function QueriesList() {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectQueriesListMode);
    const tabsList = useSelector(selectQueriesListTabs);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!tabsList.includes(activeTab)) {
            const fallbackTab = tabsList[0];
            if (fallbackTab) {
                isInitializedRef.current = true;
                dispatch(applyListMode(fallbackTab));
            }
            return;
        }

        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            dispatch(setFilter(DefaultQueriesListFilter[activeTab]));
            dispatch(resetQueryList());
        }
    }, [dispatch, activeTab, tabsList]);

    const handleTabSelect = (tabId: string) => {
        const nextTab = tabsList.find((tab) => tab === tabId);
        if (nextTab && nextTab !== activeTab) {
            dispatch(applyListMode(nextTab));
        }
    };

    if (!tabsList.includes(activeTab)) return null;
    return (
        <div className={b()}>
            <LegacyQueriesList
                tabs={tabsList.map((id) => ({id, title: getTabName(id)}))}
                activeTab={activeTab}
                onTabChange={handleTabSelect}
            />
        </div>
    );
}
