import React from 'react';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {useSelector} from 'react-redux';

import {ChytCliquePageTab} from '../../../constants/chyt-page';
import Tabs from '../../../components/Tabs/Tabs';
import {getCluster} from '../../../store/selectors/global';
import {getChytCurrrentClique} from '../../../store/selectors/chyt';
import {makeTabProps} from '../../../utils';
import {formatByParams} from '../../../utils/format';
import UIFactory from '../../../UIFactory';

import {ChytPageCliqueMonitoring} from './ChytPageCliqueMonitoring';

export function ChytPageCliqueTabs({className}: {className?: string}) {
    const match = useRouteMatch();

    const ytCluster = useSelector(getCluster);
    const chytAlias = useSelector(getChytCurrrentClique);

    const chytMonitoring = UIFactory.getMonitoringComponentForChyt();

    const tabProps = React.useMemo(() => {
        const {component, urlTemplate, title} = chytMonitoring ?? {};
        const useTemplate = urlTemplate && !component;
        return makeTabProps(
            match.url,
            ChytCliquePageTab,
            {
                [ChytCliquePageTab.MONITORING]: useTemplate
                    ? {
                          show: true,
                          external: true,
                          url: formatByParams(urlTemplate, {ytCluster, chytAlias}),
                          title,
                      }
                    : {show: Boolean(component)},
            },
            undefined,
        );
    }, [ytCluster, chytAlias, match.url, chytMonitoring]);

    return (
        <React.Fragment>
            <Tabs className={className} {...tabProps} routed />
            <Switch>
                {Boolean(chytMonitoring?.component) && (
                    <Route
                        path={`${match.url}/${ChytCliquePageTab.MONITORING}`}
                        component={ChytPageCliqueMonitoring}
                    />
                )}
                <Route
                    path={`${match.url}/${ChytCliquePageTab.SPECLET}`}
                    component={NotImplemented}
                />
                <Route path={`${match.url}/${ChytCliquePageTab.ACL}`} component={NotImplemented} />
                <Redirect to={`${match.url}/${ChytCliquePageTab.SPECLET}`} />
            </Switch>
        </React.Fragment>
    );
}

function NotImplemented() {
    return 'Not implemented';
}
