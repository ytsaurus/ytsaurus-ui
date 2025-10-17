import React, {useEffect, useMemo, useRef} from 'react';
import block from 'bem-cn-lite';
import {Tabs} from '@gravity-ui/uikit';
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

const TabNames = {
    [QueriesListMode.History]: 'History',
    [QueriesListMode.Tutorials]: 'Tutorials',
    [QueriesListMode.VCS]: 'VCS',
    [QueriesListMode.Navigation]: 'Navigation',
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

    const tabs = useMemo(
        () =>
            tabsList.map((tab) => {
                return {
                    id: tab as string,
                    title: TabNames[tab],
                };
            }),
        [tabsList],
    );

    const isVsc = activeTab === QueriesListMode.VCS;

    return (
        <div className={b()}>
            <Tabs
                className={b('tabs')}
                items={tabs}
                activeTab={activeTab}
                onSelectTab={handleTabSelect}
            />
            {activeTab === QueriesListMode.Navigation ? (
                <div className={b('content')}>
                    <Navigation />
                </div>
            ) : (
                <div className={b('content')}>
                    {!isVsc && <QueriesHistoryListFilter className={b('filter')} />}

                    {activeTab === QueriesListMode.History && <QueriesHistoryList />}
                    {activeTab === QueriesListMode.Tutorials && (
                        <QueriesTutorialList className={b('list-content')} />
                    )}
                    {isVsc && <Vcs />}
                </div>
            )}
        </div>
    );
}
