import React, {useEffect, useMemo} from 'react';
import block from 'bem-cn-lite';
import {Tabs} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {getQueriesListMode, getQueriesListTabs} from '../../../store/selectors/queries/queriesList';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesListMode} from '../../../types/query-tracker/queryList';
import {requestQueriesList} from '../../../store/actions/queries/queriesList';

import './index.scss';
import {QueriesTutorialList} from './QueriesTutorialList';
import {QueriesHistoryListFilter} from './QueriesListFilter';
import {Vcs} from '../Vcs';
import {Navigation} from '../Navigation';
import {setListMode} from '../../../store/reducers/queries/queryListSlice';

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

    useEffect(() => {
        dispatch(requestQueriesList());
    }, [dispatch]);

    const handleTabSelect = (tabId: string) => {
        dispatch(setListMode(tabId as QueriesListMode));
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
