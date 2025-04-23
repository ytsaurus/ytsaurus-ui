import {combineReducers, combineSlices} from '@reduxjs/toolkit';

import forEach_ from 'lodash/forEach';

import acl from './acl/acl';
import aclFilters from './acl/acl-filters';
import actions from './actions';
import clustersMenu from './clusters-menu/clusters-menu';
import components from './components';
import global from './global';
import supportedFeatures from './global/supported-features';
import modals from './modals';
import navigation from './navigation';
import operations from './operations';
import dashboard from './dashboard';
import settings from './settings';
import slideoutMenu from './slideoutMenu';
import system from './system';
import tables from './tables';
import tabletErrors from './tablet-errors';
import accounts from './accounts';
import pathViewer from './path-viewer';
import tablet from './tablet';
import users from './users';
import groups from './groups';
import scheduling from './scheduling';
import suggests from './suggests';
import job from './job';
import dashboard2 from './dashboard2';
import tablet_cell_bundles from './tablet_cell_bundles';
import tabletCellBundleEditor from './tablet_cell_bundles/tablet-cell-bundle-editor';
import chaos_cell_bundles from './chaos_cell_bundles';
import chaosCellBundleEditor from './chaos_cell_bundles/tablet-cell-bundle-editor';
import {manageTokens} from './manage-tokens';
import executeBatch from '../../store/reducers/execute-batch';
import UIFactory, {UIFactoryClusterPageInfo} from '../../UIFactory';
import {registerExtraPage} from '../../pages';
import {registerLocationParameters} from '../../store/location';
import {registerHeaderLink} from '../../containers/ClustersMenu/header-links-items';
import {queryTracker} from './query-tracker';
import aiChat from './ai/chatSlice';
import {odinPageInfo, odinRootPageInfo} from '../../pages/odin/lazy';
import {hasOdinPage} from '../../config';
import {chyt} from './chyt';
import {getMainLocations} from '../../store/location.main';
import {flow} from '../../store/reducers/flow';
import {rootApi} from '../../store/api';
import {prometheusDashboardSlice} from './prometheusDashboard/prometheusDashboard';
import odin from '../../pages/odin/_reducers';

export const appReducers = {
    acl,
    aclFilters,
    actions,
    clustersMenu,
    components,
    global,
    supportedFeatures,
    modals,
    navigation,
    dashboard,
    dashboard2,
    operations,
    settings,
    slideoutMenu,
    system,
    tables,
    accounts,
    pathViewer,
    tablet,
    tabletErrors,
    tablet_cell_bundles,
    tabletCellBundleEditor,
    chaos_cell_bundles,
    chaosCellBundleEditor,
    users,
    groups,
    scheduling,
    odin,
    //    schedulingOperations,
    //    schedulingCreatePoolDialog,

    suggests,
    job,

    executeBatch,
    queryTracker,
    aiChat,

    chyt,
    manageTokens,
    flow,
    [rootApi.reducerPath]: rootApi.reducer,
    prometheusDashboard: prometheusDashboardSlice.reducer,
};

export type RootState = ReturnType<ReturnType<typeof makeRootReducer>>;

export type MaintenanceEvent = {
    type: string;
    startTime: string;
    finishTime: string;
    severity: string;
    title: string;
    description: string;
    createdBy: string;
    meta?: string;
};

function registerReducersAndUrlMapping(
    item: Pick<UIFactoryClusterPageInfo, 'reducers' | 'urlMapping'>,
) {
    forEach_(item.reducers, (reducer, key) => {
        if ((appReducers as any)[key] !== undefined) {
            throw new Error('Some reducers from extraPages are trying to override each other.');
        }
        (appReducers as any)[key] = reducer;
    });

    forEach_(item.urlMapping, (pathData, path) => {
        registerLocationParameters(path, pathData);
    });
}

export function makeRootReducer() {
    getMainLocations().forEach(([path, params]) => {
        registerLocationParameters(path, params);
    });

    const extraReducersAndUrlMapping = UIFactory.getExtraReducersAndUrlMapping();
    if (extraReducersAndUrlMapping) {
        registerReducersAndUrlMapping(extraReducersAndUrlMapping);
    }

    if (hasOdinPage()) {
        registerReducersAndUrlMapping(odinPageInfo);
        registerReducersAndUrlMapping(odinRootPageInfo);
        registerExtraPage(odinPageInfo);
        registerHeaderLink({
            href: odinRootPageInfo.pageId ? `/${odinRootPageInfo.pageId}` : odinRootPageInfo.href!,
            text: odinRootPageInfo.title,
            routed: Boolean(odinRootPageInfo.reactComponent),
            getVisible: odinRootPageInfo.getVisible,
        });
    }

    const extraPages = UIFactory.getExtaClusterPages();

    extraPages.forEach((item) => {
        registerReducersAndUrlMapping(item);
        registerExtraPage(item);
    });

    UIFactory.getExtraRootPages().forEach((item) => {
        const {pageId, href, title, reactComponent, getVisible} = item;
        registerHeaderLink({
            href: pageId ? `/${pageId}` : href!,
            text: title,
            routed: Boolean(reactComponent),
            getVisible,
        });
        registerReducersAndUrlMapping(item);
    });

    const rootReducer = combineSlices({...appReducers} as any);
    return rootReducer as unknown as ReturnType<typeof combineReducers<typeof appReducers>>;
}
