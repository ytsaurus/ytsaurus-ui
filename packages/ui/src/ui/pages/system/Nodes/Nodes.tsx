import React, {Component} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';

import format from '../../../common/hammer/format';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import {NoContent} from '../../../components/NoContent/NoContent';
import Link from '../../../components/Link/Link';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {loadSystemNodes} from '../../../store/actions/system/nodes';
import {getCluster} from '../../../store/selectors/global';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {
    getSettingSystemNodesNodeType,
    getSettingsSystemNodesCollapsed,
} from '../../../store/selectors/settings-ts';
import type {RootState} from '../../../store/reducers';
import {
    ComponentsNodesLinkParams,
    makeComponentsNodesLink,
} from '../../../utils/components/nodes/node';
import {useMemoizedIfEqual, useUpdater} from '../../../hooks/use-updater';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';

import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../Proxies/RoleGroup';

import {SystemNodeTypeSelector} from './NodeTypeSelector';

import './Nodes.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

const block = cn('system-nodes');

const STATE_THEME_MAPPING = {
    alerts: 'warning',
    full: 'danger',
} as const;

type ReduxProps = ConnectedProps<typeof connector>;

class Nodes extends Component<ReduxProps> {
    onToggle = () => {
        const {collapsed, setSettingsSystemNodesCollapsed} = this.props;
        setSettingsSystemNodesCollapsed(!collapsed);
    };

    renderContent() {
        const {nodeType, roleGroups, cluster} = this.props;

        const rackNames = Object.keys(roleGroups ?? {});

        if (!roleGroups || !rackNames.length) {
            return (
                <NoContent
                    warning={
                        !nodeType.length
                            ? undefined
                            : `There are no ${nodeType.map(format.ReadableField).join(',')}`
                    }
                    hint={'Try to select another node type'}
                />
            );
        }

        const {counters} = this.props;

        const headingCN = cn('elements-heading')({
            size: 's',
            overview: 'yes',
        });

        return map_(roleGroups, (roleGroup, groupName) => {
            return !roleGroup ? null : (
                <div key={groupName} className={block()}>
                    {rackNames.length > 1 && (
                        <div className={block('group-summary', headingCN)}>
                            <Link
                                theme="primary"
                                url={makeComponentsNodesLink({
                                    cluster,
                                    rackFilter: groupName,
                                    nodeTypes: nodeType,
                                })}
                            >
                                {groupName}
                            </Link>
                            <SystemStateOverview
                                counters={counters?.[groupName]}
                                stateThemeMappings={STATE_THEME_MAPPING}
                                tab="nodes"
                                makeUrl={(params) => {
                                    return this.makeComponentNodesUrl({
                                        rackFilter: groupName,
                                        ...params,
                                    });
                                }}
                            />
                        </div>
                    )}
                    <RoleGroupsContainer>
                        {map_(roleGroup, (group) => {
                            return (
                                <RoleGroup
                                    key={group.name}
                                    data={group}
                                    makeUrl={this.makeRoleGroupUrl}
                                    showFlags
                                />
                            );
                        })}
                    </RoleGroupsContainer>
                </div>
            );
        });
    }

    makeRoleGroupUrl = (params?: MakeUrlParams) => {
        const {nodeType, cluster} = this.props;

        const {name, state: s, flag: f} = params ?? {};

        const stateAsOthers = s === 'others' ? '!online,!offline' : undefined;
        const state = s === 'online' || s === 'offline' ? s : stateAsOthers;

        const flag = s === 'banned' ? 'banned' : f;

        const p: ComponentsNodesLinkParams = {
            cluster,
            rackSelected: name ? [name] : undefined,
            nodeTypes: nodeType,
            state,
        };

        if (flag) {
            Object.assign(p, {[flag]: 'enabled'});
        }

        return makeComponentsNodesLink(p);
    };

    makeComponentNodesUrl: typeof makeComponentsNodesLink = (params) => {
        const {cluster, nodeType} = this.props;
        return makeComponentsNodesLink({cluster, nodeTypes: nodeType, ...params});
    };

    renderOverview() {
        const {overviewCounters} = this.props;

        return (
            <React.Fragment>
                <div className={block('node-type')}>
                    <SystemNodeTypeSelector />
                </div>
                <SystemStateOverview
                    counters={overviewCounters}
                    stateThemeMappings={STATE_THEME_MAPPING}
                    tab="nodes"
                />
            </React.Fragment>
        );
    }

    renderImpl() {
        const {roleGroups, loaded, collapsed} = this.props;

        if (!loaded && !roleGroups) {
            return null;
        }

        return (
            <CollapsibleSectionStateLess
                overview={this.renderOverview()}
                collapsed={collapsed}
                onToggle={this.onToggle}
                name={'Nodes'}
                size={UI_COLLAPSIBLE_SIZE}
            >
                {this.renderContent()}
            </CollapsibleSectionStateLess>
        );
    }

    render() {
        return (
            <React.Fragment>
                <NodesUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state: RootState) {
    const {roleGroups, counters, loaded, overviewCounters} = state.system.nodes;

    return {
        cluster: getCluster(state),
        loaded,
        counters,
        overviewCounters,
        collapsed: getSettingsSystemNodesCollapsed(state),
        nodeType: getSettingSystemNodesNodeType(state),
        roleGroups,
    };
}

const mapDispatchToProps = {
    setSettingsSystemNodesCollapsed,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

function NodesUpdater() {
    const dispatch = useThunkDispatch();

    const nodeTypes = useSelector(getSystemNodesNodeTypesToLoad);
    const params = useMemoizedIfEqual(nodeTypes);

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSystemNodes(...params)).then((data) => {
                    if (data?.isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch, params]);

    useUpdater(updateFn);

    return null;
}

export default connector(Nodes);
