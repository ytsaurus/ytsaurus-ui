import React from 'react';
import block from 'bem-cn-lite';
import {BranchesRight, ClockArrowRotateLeft, GraduationCap} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {
    type QueriesSidebarProps,
    type QueriesSidebarTab,
} from '@gravity-ui/querieskit/widgets/QueriesSidebar';

import {QueriesListMode} from '../../../types/query-tracker/queryList';
import {getQueriesListTabName, useQueriesListState} from './useQueriesListState';

import './index.scss';
import {useQueriesVcsProps} from '../Vcs/QueriesVcsAdapter/useQueriesVcsProps';
import {QueriesNavigationAdapter} from '../Navigation/QueriesNavigationAdapter/QueriesNavigationAdapter';
import {QueriesHistory} from './QueriesHistory';
import {QueriesTutorials} from './QueriesTutorials';

const b = block('queries-list');

type CustomTabMode = Exclude<QueriesListMode, QueriesListMode.VCS>;

const tabContent: Record<CustomTabMode, React.ReactNode> = {
    [QueriesListMode.History]: <QueriesHistory />,
    [QueriesListMode.Tutorials]: <QueriesTutorials />,
    [QueriesListMode.Navigation]: <QueriesNavigationAdapter />,
};

const tabIcons = {
    [QueriesListMode.History]: ClockArrowRotateLeft,
    [QueriesListMode.Tutorials]: GraduationCap,
    [QueriesListMode.Navigation]: BranchesRight,
};

export function useQueriesSidebar(): QueriesSidebarProps {
    const {activeTab, tabsList, onTabChange} = useQueriesListState();
    const vcsProps = useQueriesVcsProps({
        active: activeTab === QueriesListMode.VCS && tabsList.includes(QueriesListMode.VCS),
    });

    const sidebarTabs: QueriesSidebarTab[] = tabsList.map((id) => {
        if (id === QueriesListMode.VCS) return {id, type: 'vcs', props: vcsProps};
        return {
            id,
            type: 'custom',
            title: getQueriesListTabName(id),
            icon: <Icon data={tabIcons[id]} size={16} />,
            renderContent: () => <div className={b('sidebar-content')}>{tabContent[id]}</div>,
        };
    });
    return {
        tabs: tabsList.includes(activeTab) ? sidebarTabs : [],
        activeTab,
        onActiveTabChange: onTabChange,
        keepMounted: false,
    };
}
