import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import React, {useState} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';

import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import format from '../../../common/hammer/format';

import {ExpandButton} from '../../../components/ExpandButton';
import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import Link from '../../../components/Link/Link';
import {NoContent} from '../../../components/NoContent/NoContent';
import {StickyContainer} from '../../../components/StickyContainer/StickyContainer';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {useMemoizedIfEqual, useUpdater} from '../../../hooks/use-updater';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {loadSystemNodes} from '../../../store/actions/system/nodes';
import {RoleGroupInfo} from '../../../store/reducers/system/proxies';

import {getCluster} from '../../../store/selectors/global';
import type {RootState} from '../../../store/reducers';

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

import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../ProxiesImpl/RoleGroup';

import {SystemNodeTypeSelector} from './NodeTypeSelector';

import './Nodes.scss';

const block = cn('system-nodes');

const STATE_THEME_MAPPING = {
    alerts: 'warning',
    full: 'danger',
} as const;

type ReduxProps = ConnectedProps<typeof connector>;

function RackGroup({
    name: groupName,
    data: roleGroup,
    counters,
    makeComponentNodesUrl,
    makeRoleGroupUrl,
}: {
    name: string;
    data: Array<RoleGroupInfo>;
    counters: NodesProps['counters'];
    makeComponentNodesUrl: typeof makeComponentsNodesLink;
    makeRoleGroupUrl: (params?: MakeUrlParams) => string;
}) {
    const [expandAll, setExpandAll] = useState(false);

    const headingCN = cn('elements-heading')({
        size: 's',
        overview: 'yes',
    });

    return (
        <div key={groupName} className={block()}>
            <div className={block('group-summary', headingCN)}>
                <Link
                    theme="primary"
                    url={makeComponentsNodesLink({
                        rackFilter: groupName,
                    })}
                >
                    {groupName}
                </Link>
                <ExpandButton
                    className={block('expand-btn')}
                    expanded={expandAll}
                    toggleExpanded={() => setExpandAll(!expandAll)}
                    all
                    showText
                />
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
            <RoleGroupsContainer>
                {map_(roleGroup, (group) => {
                    return (
                        <RoleGroup
                            key={group.name}
                            data={group}
                            makeUrl={makeRoleGroupUrl}
                            showFlags
                            forceExpand={expandAll}
                        />
                    );
                })}
            </RoleGroupsContainer>
        </div>
    );
}

type NodesProps = ReduxProps;

const Nodes = (props: NodesProps) => {
    const onToggle = () => {
        const {collapsed} = props;
        props.setSettingsSystemNodesCollapsed(!collapsed);
    };

    const {nodeType, cluster} = props;

    const makeRoleGroupUrl = (params?: MakeUrlParams) => {
        const {name, state: s, flag: f} = params ?? {};

        const stateAsOthers = s === 'others' ? '!online,!offline' : undefined;
        const state = s === 'online' || s === 'offline' ? s : stateAsOthers;

        const flags = s === 'banned' ? ['banned' as const] : [f, '!banned' as const];

        const p: ComponentsNodesLinkParams = {
            cluster,
            rackSelected: name ? [name] : undefined,
            nodeTypes: nodeType,
            state,
        };

        flags.forEach((flag) => {
            if (flag === '!banned') {
                Object.assign(p, {banned: 'disabled'});
            } else if (flag) {
                Object.assign(p, {[flag]: 'enabled'});
            }
        });

        return makeComponentsNodesLink(p);
    };

    const makeComponentNodesUrl: typeof makeComponentsNodesLink = (params) => {
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
            </React.Fragment>
        );
    };

    const renderContent = () => {
        const {roleGroups} = props;

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

        return map_(roleGroups, (roleGroup, groupName) => {
            return (
                <RackGroup
                    name={groupName}
                    data={roleGroup}
                    counters={counters}
                    makeRoleGroupUrl={makeRoleGroupUrl}
                    makeComponentNodesUrl={makeComponentNodesUrl}
                />
            );
        });
    };

    const renderImpl = () => {
        const {roleGroups, loaded, collapsed} = props;

        if (!loaded && !roleGroups) {
            return null;
        }

        return (
            <StickyContainer>
                {({topStickyClassName}) => (
                    <CollapsibleSectionStateLess
                        overview={renderOverview()}
                        headingClassName={topStickyClassName}
                        collapsed={collapsed}
                        onToggle={onToggle}
                        name={'Nodes'}
                        size={UI_COLLAPSIBLE_SIZE}
                    >
                        {renderContent()}
                    </CollapsibleSectionStateLess>
                )}
            </StickyContainer>
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
