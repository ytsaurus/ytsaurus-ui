import React from 'react';

import {useSelector} from '../../../store/redux-hooks';

import {getGlobalLoadState} from '../../../store/selectors/global';
import {getSettingNewDashboardPage} from '../../../store/selectors/dashboard2/dashboard';

import {LOADING_STATUS, Page} from '../../../constants/index';
import {Route, Switch} from 'react-router';
import SectionName from './SectionName';
import {TabletTopRowLazy} from '../../../pages/tablet/lazy';
import {
    ChaosCellBundlesTopRowLazy,
    TabletCellBundlesTopRowLazy,
} from '../../../pages/tablet_cell_bundles/lazy';
import {AccountsTopRowLazy} from '../../../pages/accounts/lazy';
import {SchedulingTopRowLazy} from '../../../pages/scheduling/lazy';
import {NavigationTopRowLazy} from '../../../pages/navigation/lazy';
import {SystemTopRowLazy} from '../../../pages/system/lazy';
import {DashboardTopRowLazy} from '../../../pages/dashboard/lazy';
import {Dashboard2TopRowLazy} from '../../../pages/dashboard2/lazy';
import {ComponentsTopRowLazy} from '../../../pages/components/lazy';
import {makeExtraPageTopRowRoutes} from '../../../containers/ClusterPage/ExtraClusterPageRoutes';

import {odinPageInfo} from '../../../pages/odin/lazy';
import {hasOdinPage} from '../../../config';
import withLazyLoading from '../../../hocs/withLazyLoading';

import {ChytPageTopRowLazy} from '../../../pages/chyt/lazy';
import {QueryTrackerTopRowLazy} from '../../../pages/query-tracker/lazy';
import {FlowPageTopRowLazy} from '../../../pages/flow/lazy';

export default function TopRowContent() {
    const loadState = useSelector(getGlobalLoadState);
    const isNewDashboardPage = useSelector(getSettingNewDashboardPage);

    return loadState !== LOADING_STATUS.LOADED ? null : (
        <Switch>
            <Route path={`/:cluster/${Page.SYSTEM}`} component={SystemTopRowLazy} />
            <Route path={`/:cluster/${Page.NAVIGATION}`} component={NavigationTopRowLazy} />
            <Route path={`/:cluster/${Page.FLOWS}`} component={FlowPageTopRowLazy} />
            <Route path={`/:cluster/${Page.SCHEDULING}`} component={SchedulingTopRowLazy} />
            <Route path={`/:cluster/${Page.ACCOUNTS}`} component={AccountsTopRowLazy} />
            <Route path={`/:cluster/${Page.TABLET}/:id`} component={TabletTopRowLazy} />
            <Route
                path={`/:cluster/${Page.TABLET_CELL_BUNDLES}`}
                component={TabletCellBundlesTopRowLazy}
            />
            <Route
                path={`/:cluster/${Page.CHAOS_CELL_BUNDLES}`}
                component={ChaosCellBundlesTopRowLazy}
            />
            <Route
                path={`/:cluster/${Page.DASHBOARD}`}
                component={isNewDashboardPage ? Dashboard2TopRowLazy : DashboardTopRowLazy}
            />
            <Route path={`/:cluster/${Page.COMPONENTS}`} component={ComponentsTopRowLazy} />
            <Route path={`/:cluster/${Page.CHYT}`} component={ChytPageTopRowLazy} />
            <Route
                path={`/:cluster/${Page.QUERIES}`}
                component={withLazyLoading(QueryTrackerTopRowLazy)}
            />
            {hasOdinPage() && (
                <Route
                    path={`/:cluster/${odinPageInfo.pageId}`}
                    component={odinPageInfo.topRowComponent}
                />
            )}
            {makeExtraPageTopRowRoutes()}
            <Route path={'/:cluster/:page'} component={SectionName} />
        </Switch>
    );
}
