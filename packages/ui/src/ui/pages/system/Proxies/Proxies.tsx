import React, {Component} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import {compose} from 'redux';

import {CollapsibleSectionStateLess} from '../../../components/CollapsibleSection/CollapsibleSection';
import SystemStateOverview from '../SystemStateOverview/SystemStateOverview';
import withDataLoader from '../../../hocs/pages/withDataLoader';

import {cancelLoadProxies, loadProxies} from '../../../store/actions/system/proxies';
import {getUISizes} from '../../../store/selectors/global';
import {getSettingsSystemHttpProxiesCollapsed} from '../../../store/selectors/settings-ts';
import {setSettingsSystemHttpProxiesCollapsed} from '../../../store/actions/settings/settings';
import type {RootState} from '../../../store/reducers';

import {RoleGroup} from './RoleGroup';

type ReduxProps = ConnectedProps<typeof connector>;

class Proxies extends Component<ReduxProps> {
    onToggle = () => {
        const {collapsed} = this.props;
        this.props.setSettingsSystemHttpProxiesCollapsed(!collapsed);
    };

    renderOverview() {
        const {counters} = this.props;
        return <SystemStateOverview tab="http_proxies" counters={counters} />;
    }

    render() {
        const {roleGroups, counters, collapsibleSize, collapsed} = this.props;
        if (isEmpty_(roleGroups) && isEmpty_(counters)) {
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
                <div>
                    {map_(roleGroups, (data) => {
                        return (
                            <RoleGroup
                                key={data.name}
                                data={data}
                                url={`components/http_proxies?role=${data.name}`}
                            />
                        );
                    })}
                </div>
            </CollapsibleSectionStateLess>
        );
    }
}

function mapStateToProps(state: RootState) {
    const {counters, roleGroups, loaded} = state.system.proxies;

    return {
        counters,
        roleGroups,
        loaded,
        collapsibleSize: getUISizes(state).collapsibleSize,
        collapsed: getSettingsSystemHttpProxiesCollapsed(state),
    };
}

const mapDispatchToProps = {
    loadData: loadProxies,
    cancelLoadData: cancelLoadProxies,
    setSettingsSystemHttpProxiesCollapsed,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector, withDataLoader)(Proxies);
