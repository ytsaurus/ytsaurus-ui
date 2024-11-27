import React from 'react';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect, useSelector} from 'react-redux';
import {Redirect, Route, Switch, matchPath} from 'react-router';

import VersionsV2 from '../tabs/Versions/VersionsV2';
import Proxies from '../tabs/Proxies/Proxies';
import Nodes from '../tabs/nodes/Nodes/Nodes';
import Shards from '../tabs/Shards/Shards';
import NodePage from '../tabs/node/NodePage';

import Placeholder from '../Placeholder';
import Tabs from '../../../components/Tabs/Tabs';

import {PROXY_TYPE} from '../../../constants/components/proxies/proxies';
import {DEFAULT_TAB, Tab} from '../../../constants/components/main';
import {getLastVisitedTabs} from '../../../store/selectors/settings';
import {makeTabProps} from '../../../utils';
import {Page} from '../../../constants/index';

import {getCluster} from '../../../store/selectors/global';
import {tabletActiveBundleLink} from '../../../utils/components/tablet-cells';

import './Component.scss';
import {UI_TAB_SIZE} from '../../../constants/global';

const b = block(Page.COMPONENTS);

export function Components({match, lastVisitedTab = DEFAULT_TAB, tabSize, location}) {
    const props = makeTabProps(match.url, Tab);

    const nodePageMatch = matchPath(location.pathname, {
        path: `${match.path}/${Tab.NODES}/:host`,
    });

    return (
        <div className="elements-page__content">
            <section className={b(null, 'elements-main-section')}>
                {!nodePageMatch && (
                    <div className={b('heading')}>
                        <Tabs
                            {...props}
                            active={DEFAULT_TAB}
                            className={b('tabs')}
                            routed
                            size={tabSize}
                        />
                    </div>
                )}

                <div className={b('tab-viewer')}>
                    <Switch>
                        <Route path={`${match.path}/${Tab.NODES}/:host`} component={NodePage} />
                        <Route path={`${match.path}/${Tab.NODES}`} component={Nodes} />
                        <Route path={`${match.path}/${Tab.VERSIONS}`} component={VersionsV2} />
                        <Route
                            path={`${match.path}/${Tab.HTTP_PROXIES}`}
                            render={() => <Proxies key={PROXY_TYPE.HTTP} type={PROXY_TYPE.HTTP} />}
                        />
                        <Route
                            path={`${match.path}/${Tab.RPC_PROXIES}`}
                            render={() => <Proxies key={PROXY_TYPE.RPC} type={PROXY_TYPE.RPC} />}
                        />
                        <Route path={`${match.path}/${Tab.SHARDS}`} component={Shards} />
                        <Route
                            path={`${match.path}/${Tab.TABLET_CELLS}`}
                            component={RedirectToTabletCells}
                        />
                        <Route path={`${match.path}/:tab`} component={Placeholder} />
                        <Redirect from={match.url} to={`${match.url}/${lastVisitedTab}`} />
                    </Switch>
                </div>
            </section>
        </div>
    );
}

function RedirectToTabletCells() {
    const cluster = useSelector(getCluster);
    return <Redirect to={tabletActiveBundleLink(cluster, '')} />;
}

Components.propTypes = {
    // from react-router
    match: PropTypes.shape({
        path: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    }).isRequired,
    // from connect
    lastVisitedTab: PropTypes.string,
};

const mapStateToProps = (state) => {
    const lastVisitedTabs = getLastVisitedTabs(state);
    return {
        lastVisitedTab: lastVisitedTabs[Page.COMPONENTS],
        tabSize: UI_TAB_SIZE,
    };
};

export default connect(mapStateToProps)(Components);
