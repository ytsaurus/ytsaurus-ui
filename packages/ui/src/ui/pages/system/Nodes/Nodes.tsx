import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
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

import NodeTypeSelector from './NodeTypeSelector';

import './Nodes.scss';

const block = cn('system-nodes');

class Nodes extends Component {
    static propTypes = {
        // from connect
        counters: PropTypes.object,
        overviewCounters: PropTypes.object,
        rackGroups: PropTypes.object,
        racks: PropTypes.array,
        collapsed: PropTypes.bool,
        containerWidth: PropTypes.number,
        nodeType: PropTypes.array,
    };

    static defaultProps = {
        containerWidth: 1200,
    };

    onToggle = () => {
        const {collapsed, setSettingsSystemNodesCollapsed} = this.props;
        setSettingsSystemNodesCollapsed(!collapsed);
    };

    renderContent(theme) {
        const {racks, rackGroups, nodeType, containerWidth} = this.props;
        const headingCN = cn('elements-heading')({
            size: 's',
            overview: 'yes',
        });

        if (_.isEmpty(racks) && _.isEmpty(rackGroups)) {
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

        if (rackGroups) {
            const {counters} = this.props;

            return _.map(rackGroups, (rackGroup, groupName) => (
                <div key={groupName} className={block()} ref={this.container}>
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
            <div className={block()} ref={this.container}>
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
            <React.Fragment>
                <div className={block('node-type')}>
                    <NodeTypeSelector />
                </div>
                <SystemStateOverview
                    counters={overviewCounters}
                    stateThemeMappings={theme}
                    tab="nodes"
                />
            </React.Fragment>
        );
    }

    render() {
        const {racks, rackGroups, collapsibleSize, loaded, collapsed} = this.props;

        if (!loaded && !racks && !rackGroups) {
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
    const {racks, rackGroups, counters, loaded, overviewCounters} = state.system.nodes;

    return {
        loaded,
        racks,
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

export default compose(connect(mapStateToProps, mapDispatchToProps), withDataLoader)(Nodes);
