import {produce} from 'immer';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';
import {RootState} from '../../../../store/reducers';
import {initialState as listInitialState} from '../queries_list/queryListSlice';
import {initialState as navigationInitialState} from '../queryNavigation/queryNavigationSlice';

export const draftQueryParameters: LocationParameters = {
    engine: {
        stateKey: 'queryTracker.query.params.engine',
    },
    path: {
        stateKey: 'queryTracker.query.params.path',
    },
    cluster: {
        stateKey: 'queryTracker.query.params.cluster',
    },
    useDraft: {
        stateKey: 'queryTracker.query.params.useDraft',
    },
    listMode: {
        stateKey: 'queryTracker.list.listMode',
        initialState: listInitialState.listMode,
    },
    navCluster: {
        stateKey: 'queryTracker.queryNavigation.cluster',
        initialState: navigationInitialState.cluster,
    },
    navPath: {
        stateKey: 'queryTracker.queryNavigation.path',
        initialState: navigationInitialState.path,
    },
    activeTabId: {
        stateKey: 'queryTracker.tabs.activeTabId',
    },
};

export function getDraftQueryParameters(state: RootState, props: {query: RootState}): RootState {
    const queryParams = props.query.queryTracker.query.params;
    const queryTabsParams = props.query.queryTracker.tabs;
    const isActiveTabFromUrl = Boolean(queryTabsParams.activeTabId);

    return produce(state, (draft) => {
        updateIfChanged(draft.queryTracker.query.params, 'engine', queryParams.engine);
        updateIfChanged(draft.queryTracker.query.params, 'path', queryParams.path);
        updateIfChanged(draft.queryTracker.query.params, 'cluster', queryParams.cluster);
        updateIfChanged(draft.queryTracker.query.params, 'useDraft', queryParams.useDraft);
        updateIfChanged(
            draft.queryTracker.list,
            'listMode',
            props.query.queryTracker.list.listMode,
        );
        updateIfChanged(
            draft.queryTracker.queryNavigation,
            'cluster',
            props.query.queryTracker.queryNavigation.cluster,
        );
        updateIfChanged(
            draft.queryTracker.queryNavigation,
            'path',
            props.query.queryTracker.queryNavigation.path,
        );

        updateIfChanged(draft.queryTracker.tabs, 'activeTabId', queryTabsParams.activeTabId);
        updateIfChanged(draft.queryTracker.tabs, 'userChangeTab', isActiveTabFromUrl);
    });
}
