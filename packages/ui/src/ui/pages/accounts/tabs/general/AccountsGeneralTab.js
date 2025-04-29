import React, {Component} from 'react';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';

import {Select} from '@gravity-ui/uikit';

import WithStickyToolbar, {
    STICKY_TOOLBAR_BOTTOM,
} from '../../../../components/WithStickyToolbar/WithStickyToolbar';

import hammer from '../../../../common/hammer';
import {
    getFavouriteAccountsSet,
    getFilteredAccounts,
    getFilteredAccountsOfDashboard,
} from '../../../../store/selectors/accounts/dashboard';

import {
    getAccountsVisibilityMode,
    getAccountsVisibilityModeOfDashboard,
} from '../../../../store/selectors/settings';
import AccountsTotal from './AccountsTotal';

import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import withStickyHead from '../../../../components/ElementsTable/hocs/withStickyHead';
import withStickyFooter from '../../../../components/ElementsTable/hocs/withStickyFooter';
import {YTErrorBlock} from '../../../../components/Error/Error';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import Filter from '../../../../components/Filter/Filter';
import AccountLink from '../../AccountLink';
import Icon from '../../../../components/Icon/Icon';
import CustomRadioButton from '../../../../components/RadioButton/RadioButton';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import Modal from '../../../../components/Modal/Modal';
import Editor from './Editor/Editor';
import AccountAlerts from './AccountAlerts';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

import {loadUsers} from '../../../../store/actions/accounts/editor';
import {accountsToggleFavourite} from '../../../../store/actions/favourites';
import getTableProps from '../../../../utils/accounts/tables';
import {
    ACCOUNTS_CONTENT_MODE_ITEMS,
    genRadioButtonVisibleAccounts,
    makeReadableItems,
} from '../../../../utils/accounts';
import {getMediumList} from '../../../../store/selectors/thor';
import {
    changeContentFilter,
    changeMediumFilter,
    changeNameFilter,
    closeEditorModal,
    filterUsableAccounts,
    loadEditedAccount,
    setAccountsAbcServiceFilter,
    setAccountsTreeState,
    setAccountsVisibilityMode,
    setAccountsVisibilityModeOfDashboard,
    setActiveAccount,
    showEditorModal,
} from '../../../../store/actions/accounts/accounts';
import {
    getAccountsAbcServiceIdSlugFilter,
    getActiveAccountAggregationRow,
} from '../../../../store/selectors/accounts/accounts';
import {isNull} from '../../../../utils';
import {DASHBOARD_VIEW_CONTEXT} from '../../../../constants/index';
import {AccountResourceName} from '../../../../constants/accounts/accounts';

import {ProgressStackByTreeItem} from './ProgressStack';

import './AccountsGeneralTab.scss';
import {
    getAccountsColumnFields,
    getAccountsContentMode,
    getAccountsMapByName,
    getAccountsMasterMemoryContentMode,
} from '../../../../store/selectors/accounts/accounts-ts';
import {
    getCluster,
    getClusterUiConfig,
    getClusterUiConfigEnablePerAccountTabletAccounting,
} from '../../../../store/selectors/global';
import {TabletAccountingNotice} from './Editor/content/TabletsContent';
import AccountStaticConfiguration from './AccountStaticConfiguration/AccountStaticConfiguration';
import {Warning} from '../../../../components/Text/Text';
import Button from '../../../../components/Button/Button';
import MasterMemoryTableMode from './MasterMemoryTableMode';
import UIFactory from '../../../../UIFactory';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';

const b = block('accounts');
const progressTooltipClassname = b('progress-tooltip');

function Bytes({bytes, isAggregation}) {
    if (isNull(bytes)) {
        return hammer.format.NO_VALUE;
    }

    return (
        <div className={b('bytes')}>
            <div
                className={b('item', {
                    bytes: true,
                    aggregated: isAggregation,
                })}
            >
                {hammer.format['Bytes'](bytes)}
            </div>
            {!isAggregation && (
                <small className={b('item-bytes')}>{hammer.format['Number'](bytes)}</small>
            )}
        </div>
    );
}

const DB_VISIBILITY_MODE_PROPS = genRadioButtonVisibleAccounts();
const ACCOUNTS_VISIBILITY_MODE_PROPS = genRadioButtonVisibleAccounts(true);

const ElementsTableWithHeaderAndFooter = compose(withStickyHead, withStickyFooter)(ElementsTable);

Bytes.propTypes = {
    bytes: PropTypes.number,
    isAggregation: PropTypes.bool,
};

function renderBytes(bytes, isAggregation) {
    return (
        <ErrorBoundary>
            <Bytes bytes={bytes} isAggregation={isAggregation} />
        </ErrorBoundary>
    );
}

function renderNumber(value, isAggregation = false) {
    return (
        <div className={b('item', {aggregated: isAggregation})}>
            {hammer.format['Number'](value)}
        </div>
    );
}

function VisibilityNotice({mode}) {
    let message = null;
    if (mode === 'usable') {
        message =
            'Currently only the accounts for which you have the "Use" permission are displayed';
    }
    if (mode === 'favourites') {
        message = 'Currently only the accounts that marked as favourite are displayed.';
    }

    return !message ? null : <Warning>{message}</Warning>;
}

class AccountsGeneralTab extends Component {
    static propTypes = {
        accounts: PropTypes.array.isRequired,
        nameToAccountMap: PropTypes.object.isRequired,
        contextViewTree: PropTypes.array.isRequired,
        responsibleUsers: PropTypes.array.isRequired,
        clusterTotalsUsage: PropTypes.object.isRequired,
        nodesData: PropTypes.object.isRequired,
        usableAccounts: PropTypes.array.isRequired,
        activeNameFilter: PropTypes.string.isRequired,
        activeContentModeFilter: PropTypes.string.isRequired,
        activeMediumFilter: PropTypes.string.isRequired,
        mediumList: PropTypes.array.isRequired,
        editableAccount: PropTypes.object.isRequired,
        showEditor: PropTypes.bool.isRequired,
        usableError: PropTypes.object,
        usableErrorMessage: PropTypes.string,
        errorData: PropTypes.object,
        viewContext: PropTypes.string,
        loadTotals: PropTypes.bool,
        loadNodes: PropTypes.bool,
        error: PropTypes.bool,
        wasLoaded: PropTypes.bool,
        fetching: PropTypes.bool,
        activeAccount: PropTypes.string,
        accountsTreeState: PropTypes.string,
        activeAccountBreadcrumbs: PropTypes.arrayOf(
            PropTypes.shape({
                text: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
            }),
        ),
        activeAccountAggregation: PropTypes.object,
        dashboardVisibilityMode: PropTypes.string,
        favouriteAccountsSet: PropTypes.object.isRequired,

        changeNameFilter: PropTypes.func.isRequired,
        changeContentFilter: PropTypes.func.isRequired,
        changeMediumFilter: PropTypes.func.isRequired,
        filterUsableAccounts: PropTypes.func.isRequired,
        closeEditorModal: PropTypes.func.isRequired,
        loadUsers: PropTypes.func.isRequired,
        setAccountsTreeState: PropTypes.func.isRequired,
        loadEditedAccount: PropTypes.func.isRequired,
        showEditorModal: PropTypes.func.isRequired,
        setActiveAccount: PropTypes.func.isRequired,
        setAccountsVisibilityModeOfDashboard: PropTypes.func.isRequired,
        accountsToggleFavourite: PropTypes.func.isRequired,
        setAccountsAbcServiceFilter: PropTypes.func.isRequired,

        cluster: PropTypes.string,
    };

    static defaultProps = {
        viewContext: 'accounts',
    };

    renderAccountsPageHeader() {
        const {
            wasLoaded,
            loadNodes,
            loadTotals,
            nodesData,
            clusterTotalsUsage,
            accounts,
            mediumList,
            collapsibleSize,
            activeAccount,
        } = this.props;
        const isLoaded = wasLoaded && loadNodes && loadTotals;

        return (
            <div className={b('header', 'elements-section')}>
                {activeAccount ? (
                    <AccountStaticConfiguration />
                ) : (
                    <CollapsibleSection name="Media" size={collapsibleSize}>
                        {isLoaded && (
                            <AccountsTotal
                                nodesData={nodesData}
                                clusterTotalsUsage={clusterTotalsUsage}
                                accounts={accounts}
                                mediumList={mediumList}
                            />
                        )}
                    </CollapsibleSection>
                )}
            </div>
        );
    }

    renderFilters() {
        const {
            mediumList,
            viewContext,
            activeNameFilter,
            activeMediumFilter,
            activeContentModeFilter,
            dashboardVisibilityMode,
            abcServiceFilter: {slug, id} = {},
            contextView,
        } = this.props;

        const showMediumType =
            mediumList &&
            (activeContentModeFilter === 'default' || activeContentModeFilter === 'disk_space');

        const radioProps =
            contextView === DASHBOARD_VIEW_CONTEXT
                ? DB_VISIBILITY_MODE_PROPS
                : ACCOUNTS_VISIBILITY_MODE_PROPS;

        return (
            <div className={b('toolbar', 'elements-section')}>
                <div className={b('dashboard-visibility-mode', 'elements-toolbar__component')}>
                    <CustomRadioButton
                        onChange={this.onDashboardVisibilityModeChange}
                        {...radioProps}
                        value={dashboardVisibilityMode}
                    />
                </div>
                <div className={b('name-filter', 'elements-toolbar__component')}>
                    <Filter
                        hasClear
                        size="m"
                        type="text"
                        value={activeNameFilter}
                        placeholder="Account..."
                        onChange={this.props.changeNameFilter}
                        autofocus={viewContext !== DASHBOARD_VIEW_CONTEXT}
                        qa={'accounts-name-filter'}
                    />
                </div>
                {UIFactory.renderControlAbcService({
                    className: b('abc-service-filter', 'elements-toolbar__component'),
                    value: {slug, id},
                    onChange: this.onAbcServiceFilter,
                })}
                <div className={b('content-mode', 'elements-toolbar__component')}>
                    <Select
                        value={[activeContentModeFilter]}
                        options={ACCOUNTS_CONTENT_MODE_ITEMS}
                        onUpdate={(vals) => this.props.changeContentFilter(vals[0])}
                        label="Mode:"
                        qa="accounts-content-mode"
                    />
                </div>
                <div className={b('content-mode-subtype', 'elements-toolbar__component')}>
                    {!showMediumType ? (
                        <MasterMemoryTableMode />
                    ) : (
                        <Select
                            options={makeReadableItems(mediumList)}
                            value={[activeMediumFilter]}
                            onUpdate={(vals) => this.props.changeMediumFilter(vals[0])}
                            label="Medium:"
                        />
                    )}
                </div>
            </div>
        );
    }

    onAbcServiceFilter = (value) => {
        const {id, slug} = value || {};
        const {setAccountsAbcServiceFilter} = this.props;
        setAccountsAbcServiceFilter(id, slug);
    };

    onDashboardVisibilityModeChange = (event) => {
        const {viewContext} = this.props;
        if (viewContext === DASHBOARD_VIEW_CONTEXT) {
            this.props.setAccountsVisibilityModeOfDashboard(event.target.value);
        } else {
            this.props.setAccountsVisibilityMode(event.target.value);
        }
    };

    renderUsableError() {
        const {usableError} = this.props;

        return <YTErrorBlock error={usableError} />;
    }

    get templates() {
        const {
            activeAccount,
            activeMediumFilter: mediumType,
            favouriteAccountsSet,
            accountsToggleFavourite,
            columnFields,
            cluster,
            masterMemoryContentMode,
            clusterUiConfig,
        } = this.props;
        const self = this;

        const templates = {
            name(treeItem, name, toggleStateFn, itemState) {
                const {level = 0} = treeItem;

                const OFFSET = 20;
                const offsetStyle = {paddingLeft: level * OFFSET};
                const {attributes: item, children, isAggregation} = treeItem;

                if (isAggregation) {
                    return (
                        <div className={b('item', {name: true})} style={offsetStyle}>
                            <div
                                className={b('item-name', {
                                    aggregation: true,
                                })}
                            >
                                Aggregation
                            </div>
                        </div>
                    );
                }

                const hasChildren = children && children.length > 0;
                const toggler = (
                    <div
                        className={b('item-toggler', {hidden: !hasChildren})}
                        onClick={toggleStateFn}
                    >
                        <Icon awesome={itemState.collapsed ? 'angle-down' : 'angle-up'} />
                    </div>
                );

                const nameElement = (
                    <div className={b('item-name')}>
                        <AccountLink account={item.name} cluster={cluster} />
                    </div>
                );

                const isInFavourites = favouriteAccountsSet.has(item.name);
                const onFavouriteClick = () => {
                    accountsToggleFavourite(item.name);
                };
                return (
                    <div className={b('item', {name: true})} style={offsetStyle}>
                        {toggler}
                        {nameElement}
                        <div
                            className={b('item-favorite-star', {
                                active: isInFavourites,
                            })}
                            onClick={onFavouriteClick}
                        >
                            <Icon awesome={isInFavourites ? 'star-alt' : 'star'} />
                        </div>
                        {UIFactory.renderAccountsTableItemExtraControls({
                            itemClassName: b('name-extra-control'),
                            cluster,
                            clusterUiConfig,
                            account: item.name,
                            accountAttributes: item.$attributes,
                        })}
                    </div>
                );
            },

            alerts(treeItem) {
                const {attributes: account} = treeItem;
                const {alertsCount} = account;
                const text = alertsCount > 0 ? alertsCount : '';
                return (
                    text && (
                        <Tooltip
                            placement={'top-start'}
                            content={<AccountAlerts account={account} />}
                        >
                            <span className={b('alert')}>{text}</span>
                        </Tooltip>
                    )
                );
            },

            disk_space_default(treeItem) {
                return templates.disk_space_percentage(treeItem, mediumType);
            },

            disk_space_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.DISK_SPACE_PER_MEDIUM}
                        mediumType={mediumType}
                    />
                );
            },

            disk_space_usage(treeItem) {
                const value = columnFields.disk_space_usage.get(treeItem);
                return renderBytes(value, treeItem.isAggregation);
            },

            disk_space_limit(treeItem) {
                const value = columnFields.disk_space_limit.get(treeItem);
                const {isAggregation} = treeItem;
                return renderBytes(value, isAggregation);
            },

            disk_space_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.disk_space_free.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            node_count_default(treeItem) {
                return templates.node_count_percentage(treeItem);
            },

            node_count_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.NODE_COUNT}
                    />
                );
            },

            node_count_usage(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.node_count_usage.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            node_count_limit(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.node_count_limit.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            node_count_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.node_count_free.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            chunk_count_default(treeItem) {
                return templates.chunk_count_percentage(treeItem);
            },

            chunk_count_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.CHUNK_COUNT}
                    />
                );
            },

            chunk_count_usage(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.chunk_count_usage.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            chunk_count_limit(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.chunk_count_limit.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            chunk_count_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.chunk_count_free.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            tablet_count_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.TABLET_COUNT}
                    />
                );
            },

            tablet_count_usage(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_count_usage.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            tablet_count_limit(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_count_limit.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            tablet_count_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_count_free.get(treeItem);
                return renderNumber(value, isAggregation);
            },

            tablet_static_memory_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.TABLET_STATIC_MEMORY}
                    />
                );
            },

            tablet_static_memory_usage(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_static_memory_usage.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            tablet_static_memory_limit(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_static_memory_limit.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            tablet_static_memory_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.tablet_static_memory_free.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            master_memory_percentage(treeItem) {
                return (
                    <ProgressStackByTreeItem
                        className={progressTooltipClassname}
                        treeItem={treeItem}
                        activeAccount={activeAccount}
                        type={AccountResourceName.MASTER_MEMORY}
                        mediumType={masterMemoryContentMode}
                    />
                );
            },

            master_memory_usage(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.master_memory_usage.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            master_memory_limit(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.master_memory_limit.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            master_memory_free(treeItem) {
                const {isAggregation} = treeItem;
                const value = columnFields.master_memory_free.get(treeItem);
                return renderBytes(value, isAggregation);
            },

            master_memory_detailed_nodes(treeItem) {
                const {isAggregation} = treeItem;
                return renderBytes(
                    columnFields.master_memory_detailed_nodes.get(treeItem),
                    isAggregation,
                );
            },
            master_memory_detailed_chunks(treeItem) {
                const {isAggregation} = treeItem;
                return renderBytes(
                    columnFields.master_memory_detailed_chunks.get(treeItem),
                    isAggregation,
                );
            },
            master_memory_detailed_attributes(treeItem) {
                const {isAggregation} = treeItem;
                return renderBytes(
                    columnFields.master_memory_detailed_attributes.get(treeItem),
                    isAggregation,
                );
            },
            master_memory_detailed_tablets(treeItem) {
                const {isAggregation} = treeItem;
                return renderBytes(
                    columnFields.master_memory_detailed_tablets.get(treeItem),
                    isAggregation,
                );
            },
            master_memory_detailed_schemas(treeItem) {
                const {isAggregation} = treeItem;
                return renderBytes(
                    columnFields.master_memory_detailed_schemas.get(treeItem),
                    isAggregation,
                );
            },

            actions(treeItem) {
                if (treeItem.isAggregation) {
                    return null;
                }

                const {attributes: item} = treeItem;
                const commonProps = {
                    view: 'flat-secondary',
                    size: 's',
                };

                const handleClick = () => self.onEditClick(item);

                return (
                    <span>
                        <Button
                            {...commonProps}
                            title="Edit account"
                            onClick={handleClick}
                            qa={`edit-account-${item.name}`}
                        >
                            <Icon awesome="pencil" />
                        </Button>
                    </span>
                );
            },
        };

        return templates;
    }

    onEditClick(account) {
        this.props.showEditorModal(account);
    }

    renderAccountsTable() {
        const {
            activeAccount,
            contextViewTree,
            activeMediumFilter,
            activeContentModeFilter,
            fetching,
            wasLoaded,
            accountsTreeState,
            enable_per_account_tablet_accounting,
            dashboardVisibilityMode,
        } = this.props;

        const tableProps = getTableProps(
            activeAccount,
            activeContentModeFilter,
            activeMediumFilter,
        );
        const isLoading = fetching && !wasLoaded;
        const selectedIndex = activeAccount ? 0 : undefined;

        const isTCBRelative =
            activeContentModeFilter === 'tablets' || activeContentModeFilter === 'tablets_memory';

        const allowTable = !isTCBRelative || enable_per_account_tablet_accounting;

        const items = contextViewTree || [];

        return (
            <div className={b('content', 'elements-section')}>
                {!allowTable && <TabletAccountingNotice className={b('tcb-resource-notice')} />}
                {allowTable && <VisibilityNotice mode={dashboardVisibilityMode} />}
                {allowTable && (
                    <ElementsTableWithHeaderAndFooter
                        {...tableProps}
                        isLoading={isLoading}
                        treeState={accountsTreeState}
                        items={items}
                        onItemToggleState={this.onItemToggleState}
                        templates={this.templates}
                        selectedIndex={selectedIndex}
                        header={false}
                        footer={this.props.activeAccountAggregation}
                        top={STICKY_TOOLBAR_BOTTOM}
                        treeStateExpanded={!activeAccount ? [] : [items && items[0]?.key]}
                    />
                )}
            </div>
        );
    }

    onItemToggleState = () => {
        this.props.setAccountsTreeState('mixed');
    };

    renderEditorModal() {
        const {closeEditorModal, editableAccount, showEditor} = this.props;

        return (
            editableAccount.name && (
                <Modal
                    onOutsideClick={closeEditorModal}
                    onCancel={closeEditorModal}
                    visible={showEditor}
                    content={<Editor account={editableAccount} />}
                    title={editableAccount.name}
                    footer={false}
                    size={'l'}
                />
            )
        );
    }

    render() {
        const {error, usableError, wasLoaded, viewContext, fetching} = this.props;

        return (
            <div>
                <div className={b()}>
                    {viewContext !== DASHBOARD_VIEW_CONTEXT && this.renderAccountsPageHeader()}
                    <WithStickyToolbar
                        hideToolbarShadow
                        toolbar={this.renderFilters()}
                        content={
                            <div>
                                {error && <YTErrorBlock error={this.props.errorData} />}
                                {usableError && this.renderUsableError()}
                                {(wasLoaded || fetching) && this.renderAccountsTable()}
                            </div>
                        }
                    />
                </div>
                {this.renderEditorModal()}
            </div>
        );
    }
}

const makeMapStateToProps = () => {
    return (state, ownProps) => {
        const nameToAccountMap = getAccountsMapByName(state);
        const favouriteAccountsSet = getFavouriteAccountsSet(state);

        const {
            accounts: {accounts},
        } = state;

        const {viewContext} = ownProps;
        const isDashboard = viewContext === DASHBOARD_VIEW_CONTEXT;

        const contextViewTree = isDashboard
            ? getFilteredAccountsOfDashboard(state)
            : getFilteredAccounts(state);

        return {
            ...accounts,
            activeContentModeFilter: getAccountsContentMode(state),

            clusterUiConfig: getClusterUiConfig(state),

            mediumList: getMediumList(state),
            accounts: accounts.accounts,
            contextViewTree,
            nameToAccountMap,

            cluster: getCluster(state),

            activeAccountAggregation: getActiveAccountAggregationRow(state),
            favouriteAccountsSet,
            dashboardVisibilityMode: isDashboard
                ? getAccountsVisibilityModeOfDashboard(state)
                : getAccountsVisibilityMode(state),
            abcServiceFilter: getAccountsAbcServiceIdSlugFilter(state),
            columnFields: getAccountsColumnFields(state),

            enable_per_account_tablet_accounting:
                getClusterUiConfigEnablePerAccountTabletAccounting(state),

            collapsibleSize: UI_COLLAPSIBLE_SIZE,

            masterMemoryContentMode: getAccountsMasterMemoryContentMode(state),
        };
    };
};

const mapDispatchToProps = {
    changeNameFilter,
    changeContentFilter,
    changeMediumFilter,
    filterUsableAccounts,
    closeEditorModal,
    loadUsers,
    setAccountsTreeState,
    loadEditedAccount,
    setActiveAccount,
    showEditorModal,
    accountsToggleFavourite,
    setAccountsVisibilityModeOfDashboard,
    setAccountsVisibilityMode,
    setAccountsAbcServiceFilter,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(AccountsGeneralTab);
