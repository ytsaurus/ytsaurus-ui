import React, {useCallback, useEffect, useMemo} from 'react';
import block from 'bem-cn-lite';
import {Tabs, TabsItemProps} from '@gravity-ui/uikit';
import {QueriesHistoryList} from './QueriesHistoryList';

import {getQueriesListMode} from '../module/queries_list/selectors';
import {useDispatch, useSelector} from 'react-redux';
import {QueriesListMode, QueriesListModes} from '../module/queries_list/types';
import {applyListMode, requestQueriesList} from '../module/queries_list/actions';

import './index.scss';
import {QueriesTutorialList} from './QueriesTutorialList';
import {QueriesHistoryListFilter} from './QueriesListFilter';
import {Vcs} from '../Vcs';
import {Navigation} from '../Navigation';

const b = block('queires-list');

const TabNames = {
    [QueriesListMode.History]: 'History',
    [QueriesListMode.Tutorials]: 'Tutorials',
    [QueriesListMode.VCS]: 'VCS',
    [QueriesListMode.Navigation]: 'Navigation',
};

const useQueryTabs = (): [TabsItemProps[], string, (tab: string) => void] => {
    const dispatch = useDispatch();
    const selectedTab = useSelector(getQueriesListMode);
    const setTab = useCallback(
        (tab: string) => {
            dispatch(applyListMode(tab as QueriesListMode));
        },
        [dispatch],
    );

    const tabOptions = useMemo<TabsItemProps[]>(() => {
        return QueriesListModes.map((tab) => {
            return {
                id: tab as unknown as string,
                title: TabNames[tab],
            };
        });
    }, []);
    return [tabOptions, (selectedTab || QueriesListMode.History).toString(), setTab];
};

export function QueriesList() {
    const [tabs, tab, setTab] = useQueryTabs();

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(requestQueriesList());
    }, [dispatch]);

    const isVsc = tab === QueriesListMode.VCS;

    if (tab === QueriesListMode.Navigation)
        return (
            <div className={b()}>
                <Tabs className={b('tabs')} items={tabs} activeTab={tab} onSelectTab={setTab} />
                <div className={b('content')}>
                    <Navigation />
                </div>
            </div>
        );

    return (
        <div className={b()}>
            <Tabs className={b('tabs')} items={tabs} activeTab={tab} onSelectTab={setTab} />
            <div className={b('content')}>
                {!isVsc && <QueriesHistoryListFilter className={b('filter')} />}

                {tab === QueriesListMode.History && <QueriesHistoryList />}
                {tab === QueriesListMode.Tutorials && (
                    <QueriesTutorialList className={b('list-content')} />
                )}
                {isVsc && <Vcs />}
            </div>
        </div>
    );
}
