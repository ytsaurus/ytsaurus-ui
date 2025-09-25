import React, {useEffect, useRef} from 'react';
import block from 'bem-cn-lite';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {
    getQueriesListMode,
    getQueriesListTabs,
} from '../../../store/selectors/query-tracker/queriesList';
import {useDispatch, useSelector} from 'react-redux';
import {DefaultQueriesListFilter, QueriesListMode} from '../../../types/query-tracker/queryList';
import {applyListMode, requestQueriesList} from '../../../store/actions/query-tracker/queriesList';

import './index.scss';
import {QueriesTutorialList} from './QueriesTutorialList';
import {QueriesHistoryListFilter} from './QueriesListFilter';
import {Vcs} from '../Vcs';
import {Navigation} from '../Navigation';
import {setFilter} from '../../../store/reducers/query-tracker/queryListSlice';

const b = block('queries-list');

const TabNames: Record<QueriesListMode, string> = {
    [QueriesListMode.History]: 'History',
    [QueriesListMode.Tutorials]: 'Tutorials',
    [QueriesListMode.VCS]: 'VCS',
    [QueriesListMode.Navigation]: 'Navigation',
};

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
    const dispatch = useDispatch();
    const activeTab = useSelector(getQueriesListMode);
    const tabsList = useSelector(getQueriesListTabs);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            dispatch(setFilter(DefaultQueriesListFilter[activeTab]));
            dispatch(requestQueriesList({refresh: true}));
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
                            {TabNames[tab]}
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
