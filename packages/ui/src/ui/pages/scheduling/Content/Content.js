import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {Redirect, Route, Switch, withRouter} from 'react-router';
import cn from 'bem-cn-lite';

import reduce_ from 'lodash/reduce';

import Tabs from '../../../components/Tabs/Tabs';
import Placeholder from '../../../pages/components/Placeholder';
import {OverviewWithRum} from '../../../pages/scheduling/Content/tabs/Overview/Overview';
import Details from '../../../pages/scheduling/Content/tabs/Details/Details';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';

import {
    DEFAULT_TAB,
    SCHEDULING_ALLOWED_ROOT_TABS,
    SchedulingTab,
} from '../../../constants/scheduling';
import PoolAcl from '../../../pages/scheduling/Content/tabs/PoolAcl/PoolAcl';
import {
    getIsRoot,
    getPool,
    getPoolIsEphemeral,
    getTree,
    isPoolAclAllowed,
} from '../../../store/selectors/scheduling/scheduling';
import {makeTabProps} from '../../../utils';
import {formatByParams} from '../../../utils/format';

import './Content.scss';
import {getCluster} from '../../../store/selectors/global';
import SchedulingExpandedPoolsUpdater from './SchedulingExpandedPoolsUpdater';
import UIFactory from '../../../UIFactory';
import {UI_TAB_SIZE} from '../../../constants/global';
import {SchedulingMonitoring} from './tabs/Monitoring/SchedulingMonitoring';

const block = cn('scheduling-content');

Content.propTypes = {
    // from parent
    className: PropTypes.string,
    // from react-router
    match: PropTypes.shape({
        path: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        search: PropTypes.string.isRequired,
    }).isRequired,
};

function Content({className, match, location}) {
    const cluster = useSelector(getCluster);
    const pool = useSelector(getPool);
    const tree = useSelector(getTree);
    const isEphemeral = useSelector(getPoolIsEphemeral);
    const isRoot = useSelector(getIsRoot);
    const allowAcl = useSelector(isPoolAclAllowed);

    const localTab = {...SchedulingTab};

    const showSettings = reduce_(
        SchedulingTab,
        (acc, tab) => {
            acc[tab] = {show: SCHEDULING_ALLOWED_ROOT_TABS[tab] || !isRoot};
            return acc;
        },
        {},
    );

    const titleDict = {};

    const aclTab = showSettings[SchedulingTab.ACL];
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

    const extraRoutes = [];

    extraTabs.forEach((tab) => {
        const {name, title, component, urlTemplate} = tab;
        const tabSettings = {show: true};
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
    localTab[SchedulingTab.ACL] = SchedulingTab.ACL;

    const props = makeTabProps(match.url, localTab, showSettings, {pool, tree}, titleDict);

    return (
        <ErrorBoundary>
            <SchedulingExpandedPoolsUpdater />
            <div className={block(null, className)}>
                <Tabs
                    {...props}
                    active={DEFAULT_TAB}
                    className={block('tabs')}
                    routed
                    size={UI_TAB_SIZE}
                />

                <Switch>
                    <Route
                        path={`${match.path}/${SchedulingTab.OVERVIEW}`}
                        component={OverviewWithRum}
                    />
                    <Route path={`${match.path}/${SchedulingTab.DETAILS}`} component={Details} />
                    {extraRoutes}
                    {aclTab.show && (
                        <Route path={`${match.path}/${SchedulingTab.ACL}`} component={PoolAcl} />
                    )}
                    <Route path={`${match.path}/:tab`} component={Placeholder} />
                    <Redirect
                        from={match.url}
                        to={{pathname: `${match.url}/${DEFAULT_TAB}`, search: location.search}}
                    />
                </Switch>
            </div>
        </ErrorBoundary>
    );
}

export default withRouter(Content);
