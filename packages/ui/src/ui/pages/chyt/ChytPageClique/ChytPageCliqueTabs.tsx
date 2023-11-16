import React from 'react';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {useSelector} from 'react-redux';

import {ChytCliquePageTab} from '../../../constants/chyt-page';
import Tabs from '../../../components/Tabs/Tabs';
import {getCluster} from '../../../store/selectors/global';
import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {makeTabProps} from '../../../utils';
import {formatByParams} from '../../../utils/format';
import UIFactory from '../../../UIFactory';

import {ChytPageCliqueAcl} from './ChytPageCliqueAcl';
import {ChytPageCliqueSpeclet} from './ChytPageCliqueSpeclet';
import {ChytPageCliqueMonitoring} from './ChytPageCliqueMonitoring';

export function ChytPageCliqueTabs({className}: {className?: string}) {
    const match = useRouteMatch();

    const ytCluster = useSelector(getCluster);
    const chytAlias = useSelector(getChytCurrentAlias);

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

    const allowMonitoring = Boolean(chytMonitoring?.component);
    return (
        <React.Fragment>
            <Tabs className={className} {...tabProps} routed />
            <Switch>
                {allowMonitoring && (
                    <Route
                        path={`${match.url}/${ChytCliquePageTab.MONITORING}`}
                        component={ChytPageCliqueMonitoring}
                    />
                )}
                <Route
                    path={`${match.url}/${ChytCliquePageTab.SPECLET}`}
                    component={ChytPageCliqueSpeclet}
                />
                <Route
                    path={`${match.url}/${ChytCliquePageTab.ACL}`}
                    component={ChytPageCliqueAcl}
                />
                <Redirect
                    to={`${match.url}/${
                        allowMonitoring ? ChytCliquePageTab.MONITORING : ChytCliquePageTab.SPECLET
                    }`}
                />
            </Switch>
        </React.Fragment>
    );
}
