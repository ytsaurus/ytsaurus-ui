import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../reducers';
import {Action} from 'redux';
import {isSingleProgress} from '../api';
import {
    QueryResultTab,
    QueryTab,
    setActiveTab,
    setTabs,
} from '../../../reducers/queries/queryTabsSlice';
import {CompletedStates, QueryStatus} from '../../../../types/query-tracker';
import times_ from 'lodash/times';
import find_ from 'lodash/find';
import UIFactory from '../../../../UIFactory';
import {getQuery} from '../../../selectors/queries/query';
import {selectUserChangedQueryResultTab} from '../../../selectors/queries/queryTabs';
import {loadQueryResultsErrors} from '../queryResult';
import i18n from './i18n';

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

export const updateQueryTabs = (): AsyncAction => (dispatch, getState) => {
    const state = getState();
    const query = getQuery(state);
    const userChangeTab = selectUserChangedQueryResultTab(state);

    if (!query) {
        dispatch(setTabs([]));
        return;
    }

    // step1 - make tabs. Consistency is important
    const tabs: QueryTab[] = [];

    if (query.state === QueryStatus.FAILED) {
        tabs.push({id: 'error', title: i18n('title_error')});
    }

    if (query.state === QueryStatus.COMPLETED) {
        tabs.push(
            ...times_(query.result_count, (num) => {
                const suffix = query.result_count === 1 ? '' : ` #${num + 1}`;
                return {
                    id: `result/${num}` as QueryResultTab,
                    title: i18n('title_result') + suffix,
                };
            }),
        );
    }

    const progress = isSingleProgress(query?.progress) ? query.progress : {};
    const hasProgress =
        Boolean(progress?.yql_plan?.Basic.nodes.length) ||
        Boolean(progress?.yql_plan?.Basic.links?.length);

    if (query.progress && hasProgress) {
        tabs.push({
            id: 'progress',
            title: i18n('title_progress'),
        });
    }

    if (query.state === QueryStatus.COMPLETED) {
        const queryResultChartTab = UIFactory.getQueryResultChartTab();
        if (queryResultChartTab && query.result_count) {
            tabs.push(
                ...times_(query.result_count, (num) => {
                    const suffix = query.result_count === 1 ? '' : ` #${num + 1}`;
                    return {
                        id: `chart-tab/${num}` as QueryResultTab,
                        title: i18n('title_chart') + suffix,
                    };
                }),
            );
        }

        if (progress?.yql_statistics) {
            tabs.push({
                id: 'statistic',
                title: i18n('title_statistics'),
            });
        }
    }

    tabs.push({id: 'meta', title: i18n('title_metadata')});
    dispatch(setTabs(tabs));

    // Load query results errors for completed queries
    const isCompleted = find_(CompletedStates, (status) => query?.state === status);
    if (query && isCompleted) {
        dispatch(loadQueryResultsErrors(query));
    }

    //step 2 - set active tab
    if (userChangeTab || !tabs.length) return;

    if (query.state === QueryStatus.FAILED) {
        dispatch(setActiveTab('error'));
        return;
    }

    if (query.state === QueryStatus.COMPLETED) {
        const firstResultTab = tabs.find((tab) => tab.id.includes('result'));
        if (firstResultTab) {
            dispatch(setActiveTab(firstResultTab.id));
            return;
        }
    }

    if (hasProgress) {
        dispatch(setActiveTab('progress'));
        return;
    }

    dispatch(setActiveTab('meta'));
};
