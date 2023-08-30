import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import {compose} from 'redux';

import format from '../../../common/hammer/format';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import {NoContent} from '../../../components/NoContent/NoContent';
import Link from '../../../components/Link/Link';

import withDataLoader from '../../../hocs/pages/withDataLoader';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {cancelLoadNodes, loadNodes} from '../../../store/actions/system/nodes';
import {getCluster, getUISizes} from '../../../store/selectors/global';
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

import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../Proxies/RoleGroup';

import {SystemNodeTypeSelector} from './NodeTypeSelector';

import './Nodes.scss';

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

        if (s === 'others') {
            return undefined;
        }

        const state = s === 'online' || s === 'offline' ? s : undefined;

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

    render() {
        const {roleGroups, collapsibleSize, loaded, collapsed} = this.props;

        if (!loaded && !roleGroups) {
            return null;
        }

        return (
            <CollapsibleSectionStateLess
                overview={this.renderOverview()}
                collapsed={collapsed}
                onToggle={this.onToggle}
                name={'Nodes'}
                size={collapsibleSize}
            >
                {this.renderContent()}
            </CollapsibleSectionStateLess>
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
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemNodesCollapsed(state),
        nodeType: getSettingSystemNodesNodeType(state),
        roleGroups,
    };
}

const mapDispatchToProps = {
    loadData: loadNodes,
    cancelLoadData: cancelLoadNodes,
    setSettingsSystemNodesCollapsed,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector, withDataLoader)(Nodes);
