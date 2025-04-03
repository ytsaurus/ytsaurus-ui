import cn from 'bem-cn-lite';
import reduce_ from 'lodash/reduce';
import React from 'react';
import {Redirect, Route, Switch, withRouter} from 'react-router';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Tabs from '../../../components/Tabs/Tabs';
import {UI_TAB_SIZE} from '../../../constants/global';
import {DEFAULT_TAB, SCHEDULING_ALLOWED_ROOT_TABS, Tab} from '../../../constants/scheduling';
import Placeholder from '../../../pages/components/Placeholder';
import {Overview} from '../../../pages/scheduling/Content/tabs/Overview/Overview';
import PoolAcl from '../../../pages/scheduling/Content/tabs/PoolAcl/PoolAcl';
import {useSelector} from '../../../store/redux-hooks';
import {getCluster} from '../../../store/selectors/global';
import {
    getIsRoot,
    getPool,
    getPoolIsEphemeral,
    getTree,
    isPoolAclAllowed,
} from '../../../store/selectors/scheduling/scheduling';
import {TabSettings, makeTabProps} from '../../../utils';
import {makeSchedulingUrl} from '../../../utils/app-url';
import {formatByParams} from '../../../utils/format';
import './Content.scss';
import SchedulingExpandedPoolsUpdater from './SchedulingExpandedPoolsUpdater';
import {PoolAttributes} from './tabs/PoolAttributes/PoolAttributes';
import UIFactory from '../../../UIFactory';
import {SchedulingMonitoring} from './tabs/Monitoring/SchedulingMonitoring';

const block = cn('scheduling-content');

type ContentProps = {
    className?: string;
    match: {path: string; url: string};
    location: {search: string};
};

function Content({match, location}: ContentProps) {
    const cluster = useSelector(getCluster);
    const pool = useSelector(getPool);
    const tree = useSelector(getTree);
    const isEphemeral = useSelector(getPoolIsEphemeral);
    const isRoot = useSelector(getIsRoot);
    const allowAcl = useSelector(isPoolAclAllowed);

    const localTab: Record<string, string> = {...Tab};

    const showSettings = reduce_(
        Tab,
        (acc, tab) => {
            acc[tab] = {show: SCHEDULING_ALLOWED_ROOT_TABS[tab] || !isRoot};
            return acc;
        },
        {} as Record<string, TabSettings>,
    );

    const titleDict: Record<string, string> = {};

    const aclTab = showSettings[Tab.ACL];
    aclTab.show = aclTab.show && allowAcl;

    const extraTabs = [
        ...UIFactory.getSchedulingExtraTabs({
            cluster,
            pool,
            tree,
            extraOptions: {isRoot, isEphemeral},
        }),
        ...(isEphemeral
            ? []
            : [{name: 'monitoring', title: 'Monitoring', component: SchedulingMonitoring}]),
    ];

    const extraRoutes: Array<React.ReactElement> = [];

    extraTabs.forEach((tab) => {
        const {name, title, component, urlTemplate, hidden} = tab;

        const tabSettings: TabSettings = {show: !hidden};

        showSettings[name] = tabSettings;

        if (urlTemplate) {
            tabSettings.routed = false;
            tabSettings.external = true;
            tabSettings.url = formatByParams(urlTemplate, {
                ytCluster: cluster,
                ytPool: pool,
                ytPoolTree: tree,
            });
        }

        localTab[name] = name;
        if (title) {
            titleDict[name] = title;
        }
        if (component) {
            const route = <Route key={name} path={`${match.path}/${name}`} component={component} />;
            extraRoutes.push(route);
        }
    });

    delete localTab.ACL;
    localTab[Tab.ACL] = Tab.ACL;

    const props = makeTabProps(match.url, localTab, showSettings, {pool, tree}, titleDict);

    return (
        <ErrorBoundary>
            <SchedulingExpandedPoolsUpdater />
            <Tabs
                {...props}
                active={DEFAULT_TAB}
                className={block('tabs')}
                routed
                size={UI_TAB_SIZE}
            />
            <Switch>
                <Route path={`${match.path}/${Tab.OVERVIEW}`} component={Overview} />
                <Route
                    path={`${match.path}/${Tab.ATTRIBUTES}`}
                    render={() => <PoolAttributes className={block('attributes')} />}
                />
                {extraRoutes}
                {aclTab.show && <Route path={`${match.path}/${Tab.ACL}`} component={PoolAcl} />}
                <Route
                    path={`${match.path}/details`}
                    render={() => {
                        return <Redirect to={makeSchedulingUrl({pool, poolTree: tree})} />;
                    }}
                />
                <Route path={`${match.path}/:tab`} component={Placeholder} />
                <Redirect
                    from={match.url}
                    to={{pathname: `${match.url}/${DEFAULT_TAB}`, search: location.search}}
                />
            </Switch>
        </ErrorBoundary>
    );
}

export default withRouter(Content);
