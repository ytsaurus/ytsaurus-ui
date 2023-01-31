import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import _ from 'lodash';
import {compose} from 'redux';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import withDataLoader from '../../../hocs/pages/withDataLoader';
import Link from '../../../components/Link/Link';
import NodeQuad from '../NodeQuad/NodeQuad';

import {cancelLoadProxies, loadProxies} from '../../../store/actions/system/proxies';
import {isSystemResourcesLoaded} from '../../../store/selectors/system';
import {roleGroupStructure} from '../../../utils/system/proxies';
import {formatCounterName} from '../../../utils/index';
import {getUISizes} from '../../../store/selectors/global';
import {getSettingsSystemHttpProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemHttpProxiesCollapsed} from '../../../store/actions/settings/settings';

const b = block('system');

class Proxies extends Component {
    static propTypes = {
        // from connect
        counters: PropTypes.object.isRequired,
        roleGroups: PropTypes.arrayOf(roleGroupStructure).isRequired,
    };

    onToggle = () => {
        const {collapsed, setSettingsSystemHttpProxiesCollapsed} = this.props;
        setSettingsSystemHttpProxiesCollapsed(!collapsed);
    };

    renderRoleGroup(group) {
        const nodes = _.map(group.items, (proxy) => {
            const state = proxy.effectiveState;
            return <NodeQuad key={proxy.name} theme={state} />;
        });
        const url = `components/http_proxies?role=${group.name}`;

        return (
            <Link key={group.name} className={b('rack-wrapper')} url={url} routed={true}>
                <span className={block('elements-heading ')({size: 's'})}>{group.name}</span>
                <div className={b('rack', {size: 'l'})}>
                    <div className={b('rack-nodes')}>{nodes}</div>
                    <div className={b('rack-counters')}>
                        <div className={b('rack-counter', {secondary: 'yes'})}>
                            {formatCounterName('total')}
                            <span>{group.total}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    renderOverview() {
        const {counters} = this.props;
        return <SystemStateOverview tab="http_proxies" counters={counters} />;
    }

    render() {
        const {roleGroups, counters, collapsibleSize, collapsed} = this.props;
        if (_.isEmpty(roleGroups) && _.isEmpty(counters)) {
            return null;
        }

        const overview = this.renderOverview();

        return (
            <CollapsibleSectionStateLess
                name={'HTTP Proxies'}
                overview={overview}
                onToggle={this.onToggle}
                collapsed={collapsed}
                size={collapsibleSize}
            >
                <div className={b('racks')}>{_.map(roleGroups, this.renderRoleGroup)}</div>
            </CollapsibleSectionStateLess>
        );
    }
}

function mapStateToProps(state) {
    const {counters, roleGroups, loaded} = state.system.proxies;

    return {
        counters,
        roleGroups,
        loaded: loaded && isSystemResourcesLoaded(state),
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemHttpProxiesCollapsed(state),
    };
}

const mapDispatchToProps = {
    loadData: loadProxies,
    cancelLoadData: cancelLoadProxies,
    setSettingsSystemHttpProxiesCollapsed,
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withDataLoader)(Proxies);
