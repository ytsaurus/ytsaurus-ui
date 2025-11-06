import React from 'react';
import {useSelector} from 'react-redux';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {useUpdater} from '../../../hooks/use-updater';
import {setSettingsSystemCypressProxiesCollapsed} from '../../../store/actions/settings/settings';
import {loadSystemCypressProxies} from '../../../store/actions/system/cypress-proxies';
import {getCluster} from '../../../store/selectors/global';
import {getSettingsSystemCypressProxiesCollapsed} from '../../../store/selectors/settings/settings-ts';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {MakeUrlParams} from '../ProxiesImpl/RoleGroup';
import {ProxiesImpl} from '../ProxiesImpl/ProxiesImpl';
import {
    getCypressProxiesCounters,
    getCypressProxiesRoleGroups,
} from '../../../store/reducers/system/cypress-proxies';
import {SystemNodeCounters} from '../../../store/reducers/system/proxies';

function CypressProxiesOverview({counters}: {counters: SystemNodeCounters}) {
    return <SystemStateOverview tab="cypress_proxies" counters={counters} />;
}

function CypressProxies() {
    const cluster = useSelector(getCluster);
    const collapsed = useSelector(getSettingsSystemCypressProxiesCollapsed);
    const roleGroups = useSelector(getCypressProxiesRoleGroups);
    const counters = useSelector(getCypressProxiesCounters);
    const dispatch = useThunkDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSystemCypressProxies()).then((data) => {
                    if (data?.isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    const onToggle = () => {
        dispatch(setSettingsSystemCypressProxiesCollapsed(!collapsed));
    };

    return (
        <React.Fragment>
            {counters.total > 0 && (
                <ProxiesImpl
                    name={'Cypress Proxies'}
                    overview={<CypressProxiesOverview counters={counters} />}
                    onToggleCollapsed={onToggle}
                    roleGroups={roleGroups}
                    collapsed={collapsed}
                    makeUrl={(params) => makeRoleGroupUrl(params, cluster)}
                />
            )}
        </React.Fragment>
    );
}

function makeRoleGroupUrl({state}: MakeUrlParams = {}, cluster: string) {
    const params = new URLSearchParams();
    if (state) {
        params.append('state', state);
    }
    return `/${cluster}/components/cypress_proxies?${params}`;
}

export default CypressProxies;
