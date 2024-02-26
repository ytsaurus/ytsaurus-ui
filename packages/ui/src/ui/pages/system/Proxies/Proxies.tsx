import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import isEmpty_ from 'lodash/isEmpty';

import {Flex} from '@gravity-ui/uikit';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {loadSystemProxies} from '../../../store/actions/system/proxies';
import {getCluster} from '../../../store/selectors/global';
import {getSettingsSystemHttpProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemHttpProxiesCollapsed} from '../../../store/actions/settings/settings';
import type {RootState} from '../../../store/reducers';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {useUpdater} from '../../../hooks/use-updater';

import {MakeUrlParams} from './RoleGroup';
import {ProxiesImpl} from '../ProxiesImpl/ProxiesImpl';

type ReduxProps = ConnectedProps<typeof connector>;

class Proxies extends Component<ReduxProps> {
    onToggle = () => {
        const {collapsed} = this.props;
        this.props.setSettingsSystemHttpProxiesCollapsed(!collapsed);
    };

    renderOverview() {
        const {counters} = this.props;

        return <SystemStateOverview tab="http_proxies" counters={counters} />;
    }

    renderImpl() {
        const {roleGroups, counters, collapsed} = this.props;
        if (isEmpty_(roleGroups) && isEmpty_(counters)) {
            return null;
        }

        const overview = this.renderOverview();

        return (
            <ProxiesImpl
                name={'HTTP Proxies'}
                overview={overview}
                onToggleCollapsed={this.onToggle}
                roleGroups={roleGroups}
                collapsed={collapsed}
                makeUrl={this.makeRoleGroupUrl}
            />
        );
    }

    render() {
        return (
            <React.Fragment>
                <ProxiesUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }

    makeRoleGroupUrl = ({name, state}: MakeUrlParams = {}) => {
        const {cluster} = this.props;
        const params = new URLSearchParams({role: name!});
        if (state === 'banned') {
            params.append('banned', 'true');
        } else if (state) {
            params.append('state', state);
            params.append('banned', 'false');
        }
        return `/${cluster}/components/http_proxies?${params}`;
    };
}

function mapStateToProps(state: RootState) {
    const {counters, roleGroups, loaded} = state.system.proxies;

    return {
        counters,
        roleGroups,
        loaded,
        collapsed: getSettingsSystemHttpProxiesCollapsed(state),
        cluster: getCluster(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemHttpProxiesCollapsed,
};

function ProxiesUpdater() {
    const dispatch = useThunkDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSystemProxies()).then((data) => {
                    if (data?.isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Proxies);
