import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component} from 'react';
import {connect, useDispatch} from 'react-redux';
import hammer from '../../../../common/hammer';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ProxyActions from '../../../../pages/components/tabs/Proxies/ProxyActions/ProxyActions';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import TableInfo from '../../../../pages/components/TableInfo/TableInfo';
import Filter from '../../../../components/Filter/Filter';
import Select from '../../../../components/Select/Select';
import ProxyCard from './ProxyCard/ProxyCard';

import {
    changeBannedFilter,
    changeHostFilter,
    changeRoleFilter,
    changeStateFilter,
    getProxies,
    resetProxyState,
} from '../../../../store/actions/components/proxies/proxies';
import {
    getRoles,
    getStates,
    getVisibleProxies,
} from '../../../../store/selectors/components/proxies/proxies';
import {mergeScreen, splitScreen as splitScreenAction} from '../../../../store/actions/global';
import {proxiesTableColumnItems} from '../../../../utils/components/proxies/table';
import {showNodeMaintenance} from '../../../../store/actions/components/node-maintenance-modal';
import {useUpdater} from '../../../../hooks/use-updater';
import {HEADER_HEIGHT} from '../../../../constants/index';
import {isPaneSplit} from '../../../../utils';
import {
    COMPONENTS_PROXIES_TABLE_ID,
    PROXY_TYPE,
    SPLIT_TYPE,
} from '../../../../constants/components/proxies/proxies';
import {NodeColumnBanned, NodeColumnRole, NodeColumnState, NodeColumnText} from '../NodeColumns';
import {NodeMaintenanceModal} from '../../NodeMaintenanceModal/NodeMaintenanceModal';

import './Proxies.scss';

const block = cn('components-proxies');

function ProxiesUpdater({type}) {
    const dispatch = useDispatch();

    const {updateFn, destructFn} = React.useMemo(() => {
        return {
            updateFn: () => dispatch(getProxies(type)),
            destructFn: () => dispatch(resetProxyState()),
        };
    }, [dispatch, type]);

    useUpdater(updateFn, {destructFn});

    return null;
}

export class Proxies extends Component {
    static selectProps = PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    );

    static propTypes = {
        // from parent
        type: PropTypes.oneOf([PROXY_TYPE.HTTP, PROXY_TYPE.RPC]).isRequired,
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        totalItems: PropTypes.number.isRequired,
        showingItems: PropTypes.number.isRequired,
        initialLoading: PropTypes.bool.isRequired,
        hostFilter: PropTypes.string.isRequired,
        stateFilter: PropTypes.string.isRequired,
        roleFilter: PropTypes.string.isRequired,
        states: Proxies.selectProps.isRequired,
        roles: Proxies.selectProps.isRequired,
        proxies: PropTypes.arrayOf(PropTypes.object).isRequired,
        splitScreen: PropTypes.shape({
            isSplit: PropTypes.bool.isRequired,
            paneClassNames: PropTypes.array.isRequired,
            type: PropTypes.string.isRequired,
        }).isRequired,

        changeHostFilter: PropTypes.func.isRequired,
        changeStateFilter: PropTypes.func.isRequired,
        changeRoleFilter: PropTypes.func.isRequired,

        splitScreenAction: PropTypes.func.isRequired,
        mergeScreen: PropTypes.func.isRequired,
    };

    state = {
        activeProxy: null,
    };

    static renderHost(item, columnName) {
        return (
            <div
                className="elements-column_type_id elements-column_with-hover-button"
                title={item.host}
            >
                <span className="elements-monospace elements-ellipsis">
                    {hammer.format['Address'](item.host)}
                </span>
                &nbsp;
                <ClipboardButton
                    text={item.host}
                    view="flat-secondary"
                    size="s"
                    title={'Copy ' + columnName}
                />
            </div>
        );
    }

    static renderState(item) {
        return <NodeColumnState state={item.state} />;
    }

    static renderBanned(item) {
        return <NodeColumnBanned banned={item.banned} />;
    }

    static renderRole(item) {
        return <NodeColumnRole role={item.role} />;
    }

    static renderVersion(item) {
        return <NodeColumnText text={item.version} />;
    }

    static renderLoadAverage(item) {
        return <span>{hammer.format['Number'](item.loadAverage, {digits: 2})}</span>;
    }

    static renderNetworkLoad(item) {
        return <span>{item.networkLoad?.toPrecision(3) || hammer.format.NO_VALUE}</span>;
    }

    static renderUpdatedAt(item) {
        return <span>{hammer.format['DateTime'](item.updatedAt, {format: 'short'})}</span>;
    }

    get tableColumnsSets() {
        return {
            [PROXY_TYPE.HTTP]: {
                items: [
                    'host',
                    'state',
                    'banned',
                    'role',
                    'version',
                    'load_average',
                    'network_load',
                    'updated_at',
                    'actions',
                ],
            },
            [PROXY_TYPE.RPC]: {
                items: ['host', 'state', 'banned', 'role', 'version', 'actions'],
            },
        };
    }

    get tableProps() {
        const {type, initialLoading} = this.props;

        return {
            size: 's',
            css: block(),
            theme: 'light',
            striped: false,
            cssHover: true,
            isLoading: initialLoading,
            onItemClick: this.handleItemClick,
            tableId: COMPONENTS_PROXIES_TABLE_ID,
            columns: {
                items: proxiesTableColumnItems,
                sets: this.tableColumnsSets,
                mode: type,
            },
            templates: {
                host: Proxies.renderHost,
                state: Proxies.renderState,
                banned: Proxies.renderBanned,
                role: Proxies.renderRole,
                load_average: Proxies.renderLoadAverage,
                network_load: Proxies.renderNetworkLoad,
                updated_at: Proxies.renderUpdatedAt,
                actions: this.renderActions,
                version: Proxies.renderVersion,
            },
            computeKey(proxy) {
                return proxy.host;
            },
        };
    }

    handleItemClick = (proxy, index) => {
        const {proxies, splitScreenAction} = this.props;
        const paneClassNames = [block('proxy-pane'), block('info-pane')];
        const activeProxy = proxies[index];

        this.setState({activeProxy});
        splitScreenAction(SPLIT_TYPE, paneClassNames);
    };

    renderActions = (item) => {
        const {type} = this.props;

        return <ProxyActions type={type} proxy={item} />;
    };

    renderFilters() {
        const {
            initialLoading,
            hostFilter,
            changeHostFilter,
            stateFilter,
            changeStateFilter,
            states,
            roleFilter,
            changeRoleFilter,
            bannedFilter,
            changeBannedFilter,
            roles,
        } = this.props;

        return (
            <div className={block('filters')}>
                <div className={block('filter', {host: true})}>
                    <Filter
                        hasClear
                        size="m"
                        debounce={500}
                        value={hostFilter}
                        disabled={initialLoading}
                        onChange={changeHostFilter}
                        placeholder="Filter hosts..."
                    />
                </div>

                <div className={block('filter', {state: true})}>
                    <Select
                        items={states}
                        value={[stateFilter]}
                        disabled={initialLoading}
                        onUpdate={(vals) => changeStateFilter(vals[0])}
                        label="State:"
                        width="max"
                        hideFilter
                    />
                </div>

                <div className={block('filter', {role: true})}>
                    <Select
                        items={roles}
                        value={[roleFilter]}
                        disabled={initialLoading}
                        onUpdate={(vals) => changeRoleFilter(vals[0])}
                        label="Role:"
                        width="max"
                        hideFilter
                    />
                </div>

                <div className={block('filter')}>
                    <Select
                        label="Banned:"
                        items={[
                            {value: 'all', title: 'All'},
                            {value: 'true', title: 'True'},
                            {value: 'false', title: 'False'},
                        ]}
                        value={[String(bannedFilter ?? 'all')]}
                        disabled={initialLoading}
                        onUpdate={([value]) => {
                            changeBannedFilter(value);
                        }}
                        width="max"
                        hideFilter
                    />
                </div>
            </div>
        );
    }

    renderOverview() {
        const {totalItems, showingItems, splitScreen} = this.props;
        const isSplit = isPaneSplit(splitScreen, SPLIT_TYPE);

        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div
                        className={block('overview', {
                            sticky: isSticky,
                            split: isSplit,
                        })}
                    >
                        {this.renderFilters()}

                        <TableInfo showingItems={showingItems} totalItems={totalItems} />
                    </div>
                )}
            </Sticky>
        );
    }

    renderContent() {
        const {proxies, mergeScreen, splitScreen} = this.props;
        const {activeProxy} = this.state;

        return (
            <div className={block('content')}>
                <ElementsTable items={proxies} {...this.tableProps} />

                {isPaneSplit(splitScreen, SPLIT_TYPE) && (
                    <ProxyCard proxy={activeProxy} handleClose={mergeScreen} />
                )}
            </div>
        );
    }

    render() {
        return (
            <ErrorBoundary>
                <ProxiesUpdater type={this.props.type} />
                <LoadDataHandler {...this.props}>
                    <div className={block()}>
                        <StickyContainer>
                            {this.renderOverview()}
                            {this.renderContent()}
                        </StickyContainer>
                        <NodeMaintenanceModal />
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    const {components, global} = state;
    const {
        loading,
        loaded,
        error,
        errorData,
        proxies,
        hostFilter,
        stateFilter,
        bannedFilter,
        roleFilter,
    } = components.proxies.proxies;
    const {splitScreen} = global;

    const visibleProxies = getVisibleProxies(state);
    const states = getStates(state);
    const roles = getRoles(state);
    const initialLoading = loading && !loaded;

    return {
        loading,
        loaded,
        error,
        errorData,

        showingItems: visibleProxies.length,
        totalItems: proxies.length,
        proxies: visibleProxies,
        splitScreen,
        states,
        roles,
        stateFilter,
        hostFilter,
        roleFilter,
        bannedFilter,
        initialLoading,
    };
};

const mapDispatchToProps = {
    changeBannedFilter,
    changeHostFilter,
    changeStateFilter,
    changeRoleFilter,
    splitScreenAction,
    mergeScreen,

    showNodeMaintenance,
};

export default connect(mapStateToProps, mapDispatchToProps)(Proxies);
