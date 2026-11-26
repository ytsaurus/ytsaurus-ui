import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Loader} from '@gravity-ui/uikit';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {useSelector} from '../../../store/redux-hooks';

import {formatByParams} from '../../../../shared/utils/format';

import {ChytCliquePageTab} from '../../../constants/chyt-page';
import Tabs from '../../../components/Tabs/Tabs';
import {selectCluster} from '../../../store/selectors/global';
import {selectIsAdmin} from '../../../store/selectors/global/is-developer';
import {selectChytCurrentAlias} from '../../../store/selectors/chyt';
import {makeTabProps} from '../../../utils';
import UIFactory from '../../../UIFactory';
import {ytApiV4} from '../../../rum/rum-wrap-api';
import {chytApiAction} from '../../../utils/strawberryControllerApi';

import {ChytPageCliqueAcl} from './ChytPageCliqueAcl';
import {ChytPageCliqueSpeclet} from './ChytPageCliqueSpeclet';
import {ChytPageCliqueMonitoring} from './ChytPageCliqueMonitoring';
import {ChytPageCliqueMaterializedViews} from './ChytPageCliqueMaterializedViews';
import i18n from './i18n';

export function ChytPageCliqueTabs({className}: {className?: string}) {
    const match = useRouteMatch<{alias: string}>();

    const ytCluster = useSelector(selectCluster);
    const isAdmin = useSelector(selectIsAdmin);
    const chytAlias = useSelector(selectChytCurrentAlias);
    const [logsExist, setLogsExist] = useState(false);
    const [controllerSupport, setControllerSupport] = useState<{
        cluster: string;
        isAdmin: boolean;
        materializedViews: boolean;
    }>();
    const materializedViews =
        controllerSupport?.cluster === ytCluster && controllerSupport.isAdmin === isAdmin
            ? controllerSupport.materializedViews
            : undefined;

    useEffect(() => {
        const cancel = axios.CancelToken.source();
        const setSupport = (supported: boolean) => {
            if (!cancel.token.reason) {
                setControllerSupport({cluster: ytCluster, isAdmin, materializedViews: supported});
            }
        };

        chytApiAction(
            'describe',
            ytCluster,
            {},
            {
                isAdmin,
                cancelToken: cancel.token,
                skipErrorToast: true,
            },
        )
            .then(({commands}) =>
                setSupport(commands.some(({name}) => name === 'list_materialized_views')),
            )
            .catch(() => setSupport(false));

        return () => cancel.cancel();
    }, [ytCluster, isAdmin]);

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
                [ChytCliquePageTab.MATERIALIZED_VIEWS]: {
                    show: materializedViews === true,
                },
                [ChytCliquePageTab.QUERY_LOGS]: {
                    show: logsExist,
                    external: true,
                    url: `/${ytCluster}/navigation?path=${logsPath}`,
                    routed: false,
                },
            },
            undefined,
            {
                [ChytCliquePageTab.ACL]: i18n('tab-name_acl'),
                [ChytCliquePageTab.MATERIALIZED_VIEWS]: i18n('tab-name_materialized-views'),
                [ChytCliquePageTab.SPECLET]: i18n('tab-name_speclet'),
                [ChytCliquePageTab.MONITORING]: i18n('tab-name_monitoring'),
                [ChytCliquePageTab.QUERY_LOGS]: i18n('tab-name_query-logs'),
            },
        );
    }, [ytCluster, chytAlias, match.url, chytMonitoring, materializedViews, logsExist, logsPath]);

    const allowMonitoring = Boolean(chytMonitoring?.component);
    const defaultTab = allowMonitoring ? ChytCliquePageTab.MONITORING : ChytCliquePageTab.SPECLET;
    const defaultUrl = `${match.url}/${defaultTab}`;
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
                <Route
                    path={`${match.url}/${ChytCliquePageTab.MATERIALIZED_VIEWS}`}
                    render={() => {
                        if (materializedViews === undefined) {
                            return <Loader size="s" />;
                        }
                        return materializedViews ? (
                            <ChytPageCliqueMaterializedViews alias={match.params.alias} />
                        ) : (
                            <Redirect to={defaultUrl} />
                        );
                    }}
                />
                <Redirect to={defaultUrl} />
            </Switch>
        </React.Fragment>
    );
}
