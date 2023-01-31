import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';
import {compose} from 'redux';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import withDataLoader from '../../../hocs/pages/withDataLoader';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import NodeRacks from '../NodeRacks/NodeRacks';

import {formatCounterName} from '../../../utils/index';
import {cancelLoadNodes, loadNodes} from '../../../store/actions/system/nodes';
import {getUISizes} from '../../../store/selectors/global';
import {setSettingsSystemNodesCollapsed} from '../../../store/actions/settings/settings';
import {getSettingsSystemNodesCollapsed} from '../../../store/selectors/settings-ts';

import './Nodes.scss';

class Nodes extends Component {
    static propTypes = {
        // from connect
        counters: PropTypes.object,
        overviewCounters: PropTypes.object,
        rackGroups: PropTypes.object,
        racks: PropTypes.array,
        collapsed: PropTypes.bool,
        containerWidth: PropTypes.number,
    };

    static defaultProps = {
        containerWidth: 1200,
    };

    onToggle = () => {
        const {collapsed, setSettingsSystemNodesCollapsed} = this.props;
        setSettingsSystemNodesCollapsed(!collapsed);
    };

    renderContent(theme) {
        const {racks, rackGroups, containerWidth} = this.props;
        const headingCN = block('elements-heading')({
            size: 's',
            overview: 'yes',
        });

        if (rackGroups) {
            const {counters} = this.props;

            return _.map(rackGroups, (rackGroup, groupName) => (
                <div key={groupName} className={block('system-nodes')()} ref={this.container}>
                    <div className={headingCN}>
                        {groupName}
                        <SystemStateOverview
                            counters={counters[groupName]}
                            stateThemeMappings={theme}
                            tab="nodes"
                        />
                    </div>

                    <NodeRacks
                        formatCounterName={formatCounterName}
                        racks={rackGroup}
                        containerWidth={containerWidth}
                    />
                </div>
            ));
        }

        return (
            <div className={block('system-nodes')()} ref={this.container}>
                <NodeRacks
                    formatCounterName={formatCounterName}
                    racks={racks}
                    containerWidth={containerWidth}
                />
            </div>
        );
    }

    renderOverview(theme) {
        const {overviewCounters} = this.props;

        return (
            <SystemStateOverview
                counters={overviewCounters}
                stateThemeMappings={theme}
                tab="nodes"
            />
        );
    }

    render() {
        const {racks, rackGroups, collapsibleSize, collapsed} = this.props;

        if (!racks && !rackGroups) {
            return null;
        }

        const stateThemeMapping = {
            alerts: 'warning',
            full: 'danger',
        };

        return (
            <CollapsibleSectionStateLess
                overview={this.renderOverview(stateThemeMapping)}
                collapsed={collapsed}
                onToggle={this.onToggle}
                name={'Nodes'}
                size={collapsibleSize}
            >
                {this.renderContent(stateThemeMapping)}
            </CollapsibleSectionStateLess>
        );
    }
}

function mapStateToProps(state) {
    const {racks, rackGroups, counters, overviewCounters} = state.system.nodes;

    return {
        racks,
        rackGroups,
        counters,
        overviewCounters,
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemNodesCollapsed(state),
    };
}

const mapDispatchToProps = {
    loadData: loadNodes,
    cancelLoadData: cancelLoadNodes,
    setSettingsSystemNodesCollapsed,
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withDataLoader)(Nodes);
