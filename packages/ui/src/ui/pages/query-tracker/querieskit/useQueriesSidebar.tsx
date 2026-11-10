import React from 'react';
import type {QueriesSidebarProps} from '@gravity-ui/querieskit/widgets/QueriesSidebar';
import {QueriesListMode} from '../../../types/query-tracker/queryList';
import {useQueriesListState} from '../QueriesList/useQueriesListState';
import {QueriesVcsAdapter} from './QueriesVcsAdapter/QueriesVcsAdapter';
import {QueriesNavigationAdapter} from './QueriesNavigationAdapter/QueriesNavigationAdapter';
import {QueriesHistory} from './QueriesHistory/QueriesHistory';
import {QueriesTutorials} from './QueriesTutorials/QueriesTutorials';

const tabs: Record<QueriesListMode, QueriesSidebarProps['tabs'][number]> = {
    [QueriesListMode.History]: {
        id: QueriesListMode.History,
        type: 'history',
        renderContent: ({active}) => <QueriesHistory active={active} />,
    },
    [QueriesListMode.Tutorials]: {
        id: QueriesListMode.Tutorials,
        type: 'tutorials',
        renderContent: ({active}) => <QueriesTutorials active={active} />,
    },
    [QueriesListMode.Navigation]: {
        id: QueriesListMode.Navigation,
        type: 'navigation',
        renderContent: ({active}) => <QueriesNavigationAdapter active={active} />,
    },
    [QueriesListMode.VCS]: {
        id: QueriesListMode.VCS,
        type: 'vcs',
        renderContent: ({active}) => <QueriesVcsAdapter active={active} />,
    },
};

export function useQueriesSidebar(): QueriesSidebarProps {
    const {activeTab, tabsList, onTabChange} = useQueriesListState();
    return {
        tabs: tabsList.includes(activeTab) ? tabsList.map((id) => tabs[id]) : [],
        activeTab,
        onActiveTabChange: onTabChange,
    };
}
