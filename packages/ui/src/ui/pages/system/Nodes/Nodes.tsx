import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import React, {useState} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';

import format from '../../../common/hammer/format';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import Link from '../../../components/Link/Link';
import {NoContent} from '../../../components/NoContent/NoContent';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {useMemoizedIfEqual, useUpdater} from '../../../hooks/use-updater';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {loadSystemNodes} from '../../../store/actions/system/nodes';
import type {RootState} from '../../../store/reducers';
import {getCluster, getUISizes} from '../../../store/selectors/global';
import {
    getSettingSystemNodesNodeType,
    getSettingsSystemNodesCollapsed,
} from '../../../store/selectors/settings-ts';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {
    ComponentsNodesLinkParams,
    makeComponentsNodesLink,
} from '../../../utils/components/nodes/node';

import {ChevronsExpandVertical} from '@gravity-ui/icons';
import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../Proxies/RoleGroup';

import {SystemNodeTypeSelector} from './NodeTypeSelector';

import {Button, Icon} from '@gravity-ui/uikit';
import './Nodes.scss';

const block = cn('system-nodes');

const STATE_THEME_MAPPING = {
    alerts: 'warning',
    full: 'danger',
} as const;

type ReduxProps = ConnectedProps<typeof connector>;

const Nodes = (props: ReduxProps) => {
    const [collapsedAll, setCollapsedAll] = useState(true);
    const onToggle = () => {
        const {collapsed, setSettingsSystemNodesCollapsed} = props;
        setSettingsSystemNodesCollapsed(!collapsed);
    };

    const renderContent = () => {
        const {nodeType, roleGroups, cluster} = props;

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

        const {counters} = props;

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
                                    return makeComponentNodesUrl({
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
                                    makeUrl={makeRoleGroupUrl}
                                    showFlags
                                    forceCollapse={collapsedAll}
                                />
                            );
                        })}
                    </RoleGroupsContainer>
                </div>
            );
        });
    };

    const makeRoleGroupUrl = (params?: MakeUrlParams) => {
        const {nodeType, cluster} = props;

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

    const makeComponentNodesUrl: typeof makeComponentsNodesLink = (params) => {
        const {cluster, nodeType} = props;
        return makeComponentsNodesLink({cluster, nodeTypes: nodeType, ...params});
    };

    const renderOverview = () => {
        const {overviewCounters} = props;

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
                {
                    <Button
                        className={block('expand-all-button')}
                        view="outlined"
                        onClick={() => setCollapsedAll((prev) => !prev)}
                    >
                        {collapsedAll ? 'Expand All' : 'Collapse All'}
                        <Icon data={ChevronsExpandVertical} size={12} />
                    </Button>
                }
            </React.Fragment>
        );
    };

    const renderImpl = () => {
        const {roleGroups, collapsibleSize, loaded, collapsed} = props;

        if (!loaded && !roleGroups) {
            return null;
        }

        return (
            <CollapsibleSectionStateLess
                overview={renderOverview()}
                collapsed={collapsed}
                onToggle={onToggle}
                name={'Nodes'}
                size={collapsibleSize}
            >
                {renderContent()}
            </CollapsibleSectionStateLess>
        );
    };

    return (
        <React.Fragment>
            <NodesUpdater />
            {renderImpl()}
        </React.Fragment>
    );
};

function mapStateToProps(state: RootState) {
    const {roleGroups, counters, loaded, overviewCounters} = state.system.nodes;

    return {
        cluster: getCluster(state),
        loaded,
        counters,
        overviewCounters,
        collapsibleSize: getUISizes().collapsibleSize,
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
