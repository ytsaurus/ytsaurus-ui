import React, {useEffect, useRef} from 'react';
import block from 'bem-cn-lite';
import {Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {
    getQueriesListMode,
    getQueriesListTabs,
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
    const dispatch = useDispatch();
    const activeTab = useSelector(getQueriesListMode);
    const tabsList = useSelector(getQueriesListTabs);
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
