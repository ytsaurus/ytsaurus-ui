import React, {useEffect, useRef} from 'react';
import block from 'bem-cn-lite';
import {BranchesRight, ClockArrowRotateLeft, Folder, GraduationCap} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {
    QueriesSidebar,
    type QueriesSidebarTab,
} from '@gravity-ui/querieskit/widgets/QueriesSidebar';

import {
    selectQueriesListMode,
    selectQueriesListTabs,
} from '../../../store/selectors/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {DefaultQueriesListFilter, QueriesListMode} from '../../../types/query-tracker/queryList';
import {applyListMode, resetQueryList} from '../../../store/actions/query-tracker/queriesList';

import './index.scss';
import {Vcs} from '../Vcs';
import {QueriesNavigationAdapter} from '../Navigation/QueriesNavigationAdapter/QueriesNavigationAdapter';
import {LegacyQueriesList} from './LegacyQueriesList';
import {setFilter} from '../../../store/reducers/query-tracker/queryListSlice';
import i18n from './i18n';
import {selectSettingsQueryTrackerNewQueriesView} from '../../../store/selectors/settings/settings-ts';
import {QueriesHistory} from './QueriesHistory';
import {QueriesTutorials} from './QueriesTutorials';

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

const tabContent: Record<QueriesListMode, React.ReactNode> = {
    [QueriesListMode.History]: <QueriesHistory />,
    [QueriesListMode.Tutorials]: <QueriesTutorials />,
    [QueriesListMode.VCS]: <Vcs />,
    [QueriesListMode.Navigation]: <QueriesNavigationAdapter />,
};

const tabIcons = {
    [QueriesListMode.History]: ClockArrowRotateLeft,
    [QueriesListMode.Tutorials]: GraduationCap,
    [QueriesListMode.VCS]: Folder,
    [QueriesListMode.Navigation]: BranchesRight,
};

export function QueriesList() {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectQueriesListMode);
    const tabsList = useSelector(selectQueriesListTabs);
    const useNewQueriesView = useSelector(selectSettingsQueryTrackerNewQueriesView);
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

    // Wait for Redux to adopt the fallback before mounting a data adapter.
    if (!tabsList.includes(activeTab)) return null;

    const tabs = tabsList.map((id) => ({id, title: getTabName(id)}));
    const sidebarTabs: QueriesSidebarTab[] = tabs.map(({id, title}) => ({
        id,
        type: 'custom',
        title,
        icon: <Icon data={tabIcons[id]} size={16} />,
        renderContent: () => <div className={b('sidebar-content')}>{tabContent[id]}</div>,
    }));

    return (
        <div className={b({new: useNewQueriesView})}>
            {useNewQueriesView ? (
                <QueriesSidebar
                    className={b('sidebar')}
                    tabs={sidebarTabs}
                    activeTab={activeTab}
                    onActiveTabChange={handleTabSelect}
                    keepMounted={false}
                />
            ) : (
                <LegacyQueriesList
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabSelect}
                />
            )}
        </div>
    );
}
