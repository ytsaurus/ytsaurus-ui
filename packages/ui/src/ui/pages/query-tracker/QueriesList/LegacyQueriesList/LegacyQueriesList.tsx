import React from 'react';
import block from 'bem-cn-lite';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';

import {QueriesListMode} from '../../../../types/query-tracker/queryList';
import {Navigation} from '../../Navigation';
import {Vcs} from '../../Vcs';
import {QueriesHistoryList} from '../QueriesHistoryList';
import {QueriesHistoryListFilter} from '../QueriesListFilter';
import {QueriesTutorialList} from '../QueriesTutorialList';

const b = block('queries-list');

const tabContent: Record<QueriesListMode, React.ReactNode> = {
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

type Props = {
    activeTab: QueriesListMode;
    tabs: {id: QueriesListMode; title: string}[];
    onTabChange: (id: string) => void;
};

export function LegacyQueriesList({activeTab, tabs, onTabChange}: Props) {
    return (
        <TabProvider value={activeTab} onUpdate={onTabChange}>
            <TabList className={b('tabs')}>
                {tabs.map(({id, title}) => (
                    <Tab key={id} value={id}>
                        {title}
                    </Tab>
                ))}
            </TabList>
            <div className={b('content')}>
                {tabs.map(({id}) => (
                    <TabPanel key={id} value={id}>
                        {tabContent[id]}
                    </TabPanel>
                ))}
            </div>
        </TabProvider>
    );
}
