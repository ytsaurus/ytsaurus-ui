import React, {useEffect, useState} from 'react';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {useSelector} from '../../../store/redux-hooks';

import {formatByParams} from '../../../../shared/utils/format';

import {ChytCliquePageTab} from '../../../constants/chyt-page';
import Tabs from '../../../components/Tabs/Tabs';
import {getCluster} from '../../../store/selectors/global';
import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {makeTabProps} from '../../../utils';
import UIFactory from '../../../UIFactory';
import {ytApiV4} from '../../../rum/rum-wrap-api';

import {ChytPageCliqueAcl} from './ChytPageCliqueAcl';
import {ChytPageCliqueSpeclet} from './ChytPageCliqueSpeclet';
import {ChytPageCliqueMonitoring} from './ChytPageCliqueMonitoring';

export function ChytPageCliqueTabs({className}: {className?: string}) {
    const match = useRouteMatch();

    const ytCluster = useSelector(getCluster);
    const chytAlias = useSelector(getChytCurrentAlias);
    const [logsExist, setLogsExist] = useState(false);

    const chytMonitoring = UIFactory.getMonitoringComponentForChyt();

    const logsPath = `//sys/strawberry/chyt/${chytAlias}/artifacts/system_log_tables/query_log/latest`;

    useEffect(() => {
        const checkLogsExist = async () => {
            try {
                const {value} = await ytApiV4.exists({path: logsPath});
                setLogsExist(value);
            } catch {
                setLogsExist(false);
            }
        };

        if (chytAlias) {
            checkLogsExist();
        }
    }, [chytAlias]);

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
                [ChytCliquePageTab.QUERY_LOGS]: {
                    show: logsExist,
                    external: true,
                    url: `/${ytCluster}/navigation?path=${logsPath}`,
                    routed: false,
                },
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
