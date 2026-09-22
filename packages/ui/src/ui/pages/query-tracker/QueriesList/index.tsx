import React, {useEffect, useRef} from 'react';
import block from 'bem-cn-lite';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {
    selectQueriesListMode,
    selectQueriesListTabs,
} from '../../../store/selectors/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {DefaultQueriesListFilter, QueriesListMode} from '../../../types/query-tracker/queryList';
import {applyListMode, resetQueryList} from '../../../store/actions/query-tracker/queriesList';

import './index.scss';
import {QueriesTutorialList} from './QueriesTutorialList';
import {QueriesHistoryListFilter} from './QueriesListFilter';
import {Vcs} from '../Vcs';
import {Navigation} from '../Navigation';
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

function QueriesHistoryTab() {
    const useNewQueriesView = useSelector(selectSettingsQueryTrackerNewQueriesView);

    return useNewQueriesView ? (
        <QueriesHistory />
    ) : (
        <>
            <QueriesHistoryListFilter className={b('filter')} />
            <QueriesHistoryList />
        </>
    );
}

function QueriesTutorialsTab() {
    const useNewQueriesView = useSelector(selectSettingsQueryTrackerNewQueriesView);

    return useNewQueriesView ? (
        <QueriesTutorials />
    ) : (
        <>
            <QueriesHistoryListFilter className={b('filter')} />
            <QueriesTutorialList className={b('list-content')} />
        </>
    );
}

const TabContent: Record<QueriesListMode, React.ReactNode> = {
    [QueriesListMode.History]: <QueriesHistoryTab />,
    [QueriesListMode.Tutorials]: <QueriesTutorialsTab />,
    [QueriesListMode.VCS]: <Vcs />,
    [QueriesListMode.Navigation]: <Navigation />,
};

export function QueriesList() {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectQueriesListMode);
    const tabsList = useSelector(selectQueriesListTabs);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            dispatch(setFilter(DefaultQueriesListFilter[activeTab]));
            dispatch(resetQueryList());
        }
    }, [dispatch, activeTab]);

    const handleTabSelect = (tabId: string) => {
        dispatch(applyListMode(tabId as QueriesListMode));
    };

    return (
        <div className={b()}>
            <TabProvider value={activeTab} onUpdate={handleTabSelect}>
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
