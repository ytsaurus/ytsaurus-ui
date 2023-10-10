import {combineReducers} from 'redux';

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
import accounts from './accounts';
import pathViewer from './path-viewer';
import tablet from './tablet';
import users from './users';
import groups from './groups';
import scheduling from './scheduling';
import suggests from './suggests';
import job from './job';
import tablet_cell_bundles from './tablet_cell_bundles';
import tabletCellBundleEditor from './tablet_cell_bundles/tablet-cell-bundle-editor';
import chaos_cell_bundles from './chaos_cell_bundles';
import chaosCellBundleEditor from './chaos_cell_bundles/tablet-cell-bundle-editor';
import {ClusterUiConfig} from '../../../shared/yt-types';
import executeBatch from '../../store/reducers/execute-batch';
import UIFactory, {UIFactoryClusterPageInfo} from '../../UIFactory';
import {registerExtraPage} from '../../pages';
import {registerLocationParameters} from '../../store/location';
import _ from 'lodash';
import {registerHeaderLink} from '../../containers/ClustersMenu/header-links-items';
import {queryTracker} from '../../pages/query-tracker/module';
import {odinPageInfo, odinRootPageInfo} from '../../pages/odin';
import {hasOdinPage} from '../../config';
import {chyt} from './chyt';

const appReducers = {
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
    operations,
    settings,
    slideoutMenu,
    system,
    tables,
    accounts,
    pathViewer,
    tablet,
    tablet_cell_bundles,
    tabletCellBundleEditor,
    chaos_cell_bundles,
    chaosCellBundleEditor,
    users,
    groups,
    scheduling,
    //    schedulingOperations,
    //    schedulingCreatePoolDialog,

    suggests,
    job,

    executeBatch,
    queryTracker,

    chyt,
};

export type RootState = Omit<ReturnType<ReturnType<typeof makeRootReducer>>, 'global'> & {
    global: {
        [key: string]: any;
        clusterUiConfig: ClusterUiConfig;
        cluster?: string;
        rootPagesCluster?: string;
        asideHeaderWidth: number;
        schedulerVersion: string;
        masterVersion: string;
        allowedExperimentalPages: Array<string>;
    };
};

function registerReducersAndUrlMapping(
    item: Pick<UIFactoryClusterPageInfo, 'reducers' | 'urlMapping'>,
) {
    _.forEach(item.reducers, (reducer, key) => {
        if ((appReducers as any)[key] !== undefined) {
            throw new Error('Some reducers from extraPages are trying to override each other.');
        }
        (appReducers as any)[key] = reducer;
    });

    _.forEach(item.urlMapping, (pathData, path) => {
        registerLocationParameters(path, pathData);
    });
}

export function makeRootReducer() {
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

    const rootReducer = combineReducers({...appReducers});
    return rootReducer;
}
