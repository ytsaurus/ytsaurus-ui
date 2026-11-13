import React from 'react';
import block from 'bem-cn-lite';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {QueriesListMode} from '../../../types/query-tracker/queryList';
import {useQueriesListState} from './useQueriesListState';

import './index.scss';
import {QueriesTutorialList} from './QueriesTutorialList';
import {QueriesHistoryListFilter} from './QueriesListFilter';
import {Vcs} from '../Vcs';
import {Navigation} from '../Navigation';
import i18n from './i18n';

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

const TabContent: Record<QueriesListMode, React.ReactNode> = {
    [QueriesListMode.History]: (
        <>
            <QueriesHistoryListFilter className={b('filter')} />
            <QueriesHistoryList />
        </>
    ),
    [QueriesListMode.Tutorials]: (
        <>
            <QueriesHistoryListFilter className={b('filter')} />
            <QueriesTutorialList className={b('list-content')} />
        </>
    ),
    [QueriesListMode.VCS]: <Vcs />,
    [QueriesListMode.Navigation]: <Navigation />,
};

export function QueriesList() {
    const {activeTab, tabsList, onTabChange} = useQueriesListState();

    return (
        <div className={b()}>
            <TabProvider value={activeTab} onUpdate={onTabChange}>
                <TabList className={b('tabs')}>
                    {tabsList.map((tab) => (
                        <Tab key={tab} value={tab}>
                            {getTabName(tab)}
                        </Tab>
                    ))}
                </TabList>
                <div className={b('content')}>
                    {tabsList.map((tab) => (
                        <TabPanel key={tab} value={tab}>
                            {TabContent[tab]}
                        </TabPanel>
                    ))}
                </div>
            </TabProvider>
        </div>
    );
}
