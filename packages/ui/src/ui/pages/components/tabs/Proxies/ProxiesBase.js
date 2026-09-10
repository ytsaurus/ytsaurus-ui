import React, {Component} from 'react';
import {useDispatch} from '../../../../store/redux-hooks';

import hammer from '../../../../common/hammer';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ProxyActions from '../../../../pages/components/tabs/Proxies/ProxyActions/ProxyActions';
import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import {ClipboardButton} from '@ytsaurus/components';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import TableInfo from '../../../../pages/components/TableInfo/TableInfo';
import Filter from '../../../../components/Filter/Filter';
import Select from '../../../../components/Select/Select';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import ProxyCard from './ProxyCard/ProxyCard';

import {getProxies, resetProxyState} from '../../../../store/actions/components/proxies/proxies';
import {proxiesTableColumnItems} from '../../../../utils/components/proxies/table';
import {useUpdater} from '../../../../hooks/use-updater';
import {isPaneSplit} from '../../../../utils';
import {
    COMPONENTS_PROXIES_TABLE_ID,
    PROXY_TYPE,
    SPLIT_TYPE,
} from '../../../../constants/components/proxies/proxies';
import {NodeColumnBanned, NodeColumnRole, NodeColumnState, NodeColumnText} from '../NodeColumns';
import {NodeMaintenanceModal} from '../../NodeMaintenanceModal/NodeMaintenanceModal';

import i18n from './i18n';

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

export class ProxiesBase extends Component {
    static selectProps = PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    );

    static propTypes = {
        // from parent
        type: PropTypes.oneOf([PROXY_TYPE.HTTP, PROXY_TYPE.RPC, PROXY_TYPE.CYPRESS]).isRequired,
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
        states: ProxiesBase.selectProps.isRequired,
        roles: ProxiesBase.selectProps.isRequired,
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
                    title={i18n('action_copy', {columnName})}
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
            [PROXY_TYPE.CYPRESS]: {
                items: ['host', 'state', 'version'],
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
                host: ProxiesBase.renderHost,
                state: ProxiesBase.renderState,
                banned: ProxiesBase.renderBanned,
                role: ProxiesBase.renderRole,
                load_average: ProxiesBase.renderLoadAverage,
                network_load: ProxiesBase.renderNetworkLoad,
                updated_at: ProxiesBase.renderUpdatedAt,
                actions: this.renderActions,
                version: ProxiesBase.renderVersion,
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
            type,
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
                        placeholder={i18n('field_filter-hosts')}
                    />
                </div>

                <div className={block('filter', {state: true})}>
                    <Select
                        items={states}
                        value={[stateFilter]}
                        disabled={initialLoading}
                        onUpdate={(vals) => changeStateFilter(vals[0])}
                        label={i18n('field_state') + ':'}
                        width="max"
                        hideFilter
                    />
                </div>

                {type !== PROXY_TYPE.CYPRESS && (
                    <div className={block('filter', {role: true})}>
                        <Select
                            items={roles}
                            value={[roleFilter]}
                            disabled={initialLoading}
                            onUpdate={(vals) => changeRoleFilter(vals[0])}
                            label={i18n('field_role') + ':'}
                            width="max"
                        />
                    </div>
                )}

                {type !== PROXY_TYPE.CYPRESS && (
                    <div className={block('filter')}>
                        <Select
                            label={i18n('field_banned') + ':'}
                            items={[
                                {value: 'all', title: i18n('value_all')},
                                {value: 'true', title: i18n('value_true')},
                                {value: 'false', title: i18n('value_false')},
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
                )}
            </div>
        );
    }

    renderToolbar() {
        const {totalItems, showingItems} = this.props;

        return (
            <Toolbar
                itemsToWrap={[
                    {
                        node: this.renderFilters(),
                        growable: true,
                    },
                    {
                        node: <TableInfo showingItems={showingItems} totalItems={totalItems} />,
                    },
                ]}
            />
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
                        <WithStickyToolbar
                            topMargin="none"
                            toolbar={this.renderToolbar()}
                            content={this.renderContent()}
                        />
                        <NodeMaintenanceModal />
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}
