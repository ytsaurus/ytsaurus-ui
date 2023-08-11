import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import {compose} from 'redux';

import format from '../../../common/hammer/format';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import {NoContent} from '../../../components/NoContent/NoContent';

import withDataLoader from '../../../hocs/pages/withDataLoader';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import NodeRacks from '../NodeRacks/NodeRacks';

import {formatCounterName} from '../../../utils/index';
import {cancelLoadNodes, loadNodes} from '../../../store/actions/system/nodes';
import {getUISizes} from '../../../store/selectors/global';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {
    getSettingSystemNodesNodeType,
    getSettingsSystemNodesCollapsed,
} from '../../../store/selectors/settings-ts';
import type {RootState} from '../../../store/reducers';

import NodeTypeSelector from './NodeTypeSelector';

import './Nodes.scss';

const block = cn('system-nodes');

const STATE_THEME_MAPPING = {
    alerts: 'warning',
    full: 'danger',
};

type ReduxProps = ConnectedProps<typeof connector>;

class Nodes extends Component<ReduxProps> {
    onToggle = () => {
        const {collapsed, setSettingsSystemNodesCollapsed} = this.props;
        setSettingsSystemNodesCollapsed(!collapsed);
    };

    renderContent() {
        const {rackGroups, nodeType} = this.props;
        const headingCN = cn('elements-heading')({
            size: 's',
            overview: 'yes',
        });

        const rackNames = Object.keys(rackGroups ?? {});

        if (!rackGroups || !rackNames.length) {
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

        if (rackNames.length > 1) {
            const {counters} = this.props;

            return _.map(rackGroups, (rackGroup, groupName) => (
                <div key={groupName} className={block()}>
                    <div className={headingCN}>
                        {groupName}
                        <SystemStateOverview
                            counters={counters?.[groupName]}
                            stateThemeMappings={STATE_THEME_MAPPING}
                            tab="nodes"
                        />
                    </div>

                    <NodeRacks
                        formatCounterName={formatCounterName}
                        racks={rackGroup}
                        containerWidth={1200}
                    />
                </div>
            ));
        }

        return (
            <div className={block()}>
                <NodeRacks
                    formatCounterName={formatCounterName}
                    racks={rackGroups[rackNames[0]] as any}
                    containerWidth={1200}
                />
            </div>
        );
    }

    renderOverview() {
        const {overviewCounters} = this.props;

        return (
            <React.Fragment>
                <div className={block('node-type')}>
                    <NodeTypeSelector />
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
        const {rackGroups, collapsibleSize, loaded, collapsed} = this.props;

        if (!loaded && !rackGroups) {
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
    const {rackGroups, counters, loaded, overviewCounters} = state.system.nodes;

    return {
        loaded,
        rackGroups,
        counters,
        overviewCounters,
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemNodesCollapsed(state),
        nodeType: getSettingSystemNodesNodeType(state),
    };
}

const mapDispatchToProps = {
    loadData: loadNodes,
    cancelLoadData: cancelLoadNodes,
    setSettingsSystemNodesCollapsed,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector, withDataLoader)(Nodes);
