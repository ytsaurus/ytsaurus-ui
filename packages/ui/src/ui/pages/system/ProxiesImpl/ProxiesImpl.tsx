import React from 'react';
import map_ from 'lodash/map';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';

import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';
import {ExpandButton} from '../../../components/ExpandButton';
import {RoleGroupInfo} from '../../../store/reducers/system/proxies';
import {MakeUrlParams, RoleGroup, RoleGroupsContainer} from '../ProxiesImpl/RoleGroup';

export function ProxiesImpl({
    name,
    roleGroups,
    collapsed,
    onToggleCollapsed,
    overview,
    makeUrl,
}: {
    name: 'HTTP Proxies' | 'RPC Proxies';
    roleGroups: Array<RoleGroupInfo>;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    overview: React.ReactNode;

    makeUrl: (params?: MakeUrlParams) => string;
}) {
    const [expandRacks, setExpandRacks] = React.useState(false);

    return (
        <CollapsibleSectionStateLess
            name={name}
            overview={
                <>
                    {!collapsed && (
                        <ExpandButton
                            all
                            showText
                            expanded={expandRacks}
                            toggleExpanded={() => setExpandRacks(!expandRacks)}
                        />
                    )}
                    {overview}
                </>
            }
            onToggle={onToggleCollapsed}
            collapsed={collapsed}
            size={UI_COLLAPSIBLE_SIZE}
            togglerRightPadding="small"
        >
            <RoleGroupsContainer>
                {map_(roleGroups, (data) => {
                    return (
                        <RoleGroup
                            key={data.name}
                            data={data}
                            makeUrl={makeUrl}
                            hideOthers
                            bannedAsState
                            forceExpand={expandRacks}
                        />
                    );
                })}
            </RoleGroupsContainer>
        </CollapsibleSectionStateLess>
    );
}
