import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {loadSystemProxies} from '../../../store/actions/system/proxies';
import {getCluster} from '../../../store/selectors/global';
import {getSettingsSystemHttpProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemHttpProxiesCollapsed} from '../../../store/actions/settings/settings';
import type {RootState} from '../../../store/reducers';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {useUpdater} from '../../../hooks/use-updater';

import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from './RoleGroup';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

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
            <CollapsibleSectionStateLess
                name={'HTTP Proxies'}
                overview={overview}
                onToggle={this.onToggle}
                collapsed={collapsed}
                size={UI_COLLAPSIBLE_SIZE}
            >
                <RoleGroupsContainer>
                    {map_(roleGroups, (data) => {
                        return (
                            <RoleGroup
                                key={data.name}
                                data={data}
                                makeUrl={this.makeRoleGroupUrl}
                                hideOthers
                                bannedAsState
                            />
                        );
                    })}
                </RoleGroupsContainer>
            </CollapsibleSectionStateLess>
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
