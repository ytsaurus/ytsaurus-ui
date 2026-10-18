import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import React, {useState} from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import {Flex} from '@gravity-ui/uikit';
import {SegmentedRadioGroupOrSelect} from '../../../components/SegmentedRadioGroupOrSelect/SegmentedRadioGroupOrSelect';
import {type DescribedSettings} from '../../../../shared/constants/settings-types';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import format from '../../../common/hammer/format';

import {ExpandButton} from '../../../components/ExpandButton';
import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import Link from '../../../containers/Link/Link';
import {NoContent} from '../../../components/NoContent';
import {StickyContainer} from '../../../components/StickyContainer/StickyContainer';

import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';

import {useMemoizedIfEqual, useUpdater} from '../../../hooks';
import {setSettingByKey} from '../../../store/actions/settings';
import {selectSettingsData} from '../../../store/selectors/settings/settings-base';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {loadSystemNodes} from '../../../store/actions/system/nodes';
import {type RoleGroupInfo} from '../../../store/reducers/system/proxies';

import {selectCluster} from '../../../store/selectors/global';
import {type RootState} from '../../../store/reducers';

import {
    selectSettingSystemNodesNodeType,
    selectSettingsSystemNodesCollapsed,
} from '../../../store/selectors/settings/settings-ts';
import {selectSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {
    type ComponentsNodesLinkParams,
    makeComponentsNodesLink,
} from '../../../utils/components/nodes/node';

import {type MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../ProxiesImpl/RoleGroup';

import {SystemNodeTypeSelector} from './NodeTypeSelector';

import i18n from './i18n';

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
    short,
}: {
    short: boolean;
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
        <div key={groupName} className={block({short})}>
            <Flex
                className={block('group-summary', headingCN)}
                alignItems="center"
                gap={short ? 4 : undefined}
            >
                <Link
                    theme="primary"
                    url={makeComponentsNodesLink({
                        rackFilter: groupName,
                    })}
                >
                    {groupName}
                </Link>
                {!short && (
                    <ExpandButton
                        className={block('expand-btn')}
                        expanded={expandAll}
                        toggleExpanded={() => setExpandAll(!expandAll)}
                        all
                        showText
                    />
                )}
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
            </Flex>
            {!short && (
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
            )}
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

        let flags: Array<typeof f | 'banned' | '!banned'> = [f];
        if (s === 'banned') {
            flags = ['banned'];
        } else if (s) {
            flags = [f, '!banned'];
        }

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
                <Flex
                    className={block('view-mode')}
                    alignItems="center"
                    grow={1}
                    role="group"
                    aria-label={i18n('field_view')}
                >
                    <SegmentedRadioGroupOrSelect
                        value={props.viewMode}
                        onUpdate={props.setViewMode}
                        options={[
                            {value: 'detailed', text: i18n('value_detailed')},
                            {value: 'short', text: i18n('value_short')},
                        ]}
                    />
                </Flex>
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
                            : i18n('alert_no-nodes', {
                                  nodeTypes: nodeType.map(format.ReadableField).join(','),
                              })
                    }
                    hint={i18n('context_select-another-node-type')}
                />
            );
        }

        const {counters} = props;

        return map_(roleGroups, (roleGroup, groupName) => {
            return (
                <RackGroup
                    key={groupName}
                    short={props.viewMode === 'short'}
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
                {({stickyTopClassName}) => (
                    <CollapsibleSectionStateLess
                        overview={renderOverview()}
                        headingClassName={stickyTopClassName}
                        collapsed={collapsed}
                        onToggle={onToggle}
                        name={i18n('title_nodes')}
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
        cluster: selectCluster(state),
        loaded,
        counters,
        overviewCounters,
        collapsed: selectSettingsSystemNodesCollapsed(state),
        nodeType: selectSettingSystemNodesNodeType(state),
        viewMode: selectSettingsData(state)['global::system::nodesViewMode'] ?? 'detailed',
        roleGroups,
    };
}

const mapDispatchToProps = {
    setSettingsSystemNodesCollapsed,
    setViewMode: (value: NonNullable<DescribedSettings['global::system::nodesViewMode']>) =>
        setSettingByKey('global::system::nodesViewMode', value),
};

const connector = connect(mapStateToProps, mapDispatchToProps);

function NodesUpdater() {
    const dispatch = useDispatch();

    const nodeTypes = useSelector(selectSystemNodesNodeTypesToLoad);
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
