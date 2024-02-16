import React, {useCallback} from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';
import {useDispatch, useSelector} from 'react-redux';

import {
    fetchAccountUsageList,
    fetchAccountUsageTree,
    openAccountAttributesModal,
    setAccountUsageDataFilter,
    setAccountUsageSortState,
} from '../../../../store/actions/accounts/account-usage';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {
    getAccountUsageAvailableColumns,
    getAccountUsageCurrentSnapshot,
    getAccountUsageListDiffError,
    getAccountUsageListDiffItems,
    getAccountUsageListDiffLoaded,
    getAccountUsageListDiffLoading,
    getAccountUsageListDiffMediums,
    getAccountUsageListError,
    getAccountUsageListItems,
    getAccountUsageListLoaded,
    getAccountUsageListLoading,
    getAccountUsageListMediums,
    getAccountUsagePageCount,
    getAccountUsagePageIndex,
    getAccountUsageSortStateByColumn,
    getAccountUsageTreeDiffError,
    getAccountUsageTreeDiffItems,
    getAccountUsageTreeDiffLoaded,
    getAccountUsageTreeDiffLoading,
    getAccountUsageTreeDiffMediums,
    getAccountUsageTreeError,
    getAccountUsageTreeItems,
    getAccountUsageTreeItemsBasePath,
    getAccountUsageTreeLoaded,
    getAccountUsageTreeLoading,
    getAccountUsageTreeMediums,
    getAccountUsageViewType,
    getAccountUsageVisibleDataColumns,
    getAccountsUsageDiffFromSnapshot,
    getAccountsUsageDiffToSnapshot,
    isAccountsUsageDiffView,
    readableAccountUsageColumnName,
} from '../../../../store/selectors/accounts/account-usage';
import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';

import ErrorBlock from '../../../../components/Error/Error';
import {
    STICKY_DOUBLE_TOOLBAR_BOTTOM,
    STICKY_TOOLBAR_BOTTOM,
} from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../../components/Icon/Icon';
import {getCluster} from '../../../../store/selectors/global';
import Loader from '../../../../components/Loader/Loader';

import {UserCard} from '../../../../components/UserLink/UserLink';
import {Secondary, Warning} from '../../../../components/Text/Text';
import PathView from '../../../../containers/PathFragment/PathFragment';
import {getIconNameForType} from '../../../../utils/navigation/path-editor';
import {OrderType} from '../../../../utils/sort-helpers';
import {NoContent} from '../../../../components/NoContent/NoContent';
import {
    AccountUsageDataItem,
    MediumKeyTemplate,
    VersionedKeyTemplate,
} from '../../../../store/reducers/accounts/usage/account-usage-types';
import {
    fetchAccountUsageListDiff,
    fetchAccountUsageTreeDiff,
} from '../../../../store/actions/accounts/account-usage-diff';
import {useUpdater} from '../../../../hooks/use-updater';

import './AccountUsageDetails.scss';
import {AccountActionsField, AccountRequestData} from './AccountActionsField';
import {DetailTableCell} from './DetailTableCell';

const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
};

const TABLE_SETTINGS_DOUBLE_TOOLBAR: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_DOUBLE_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
};

const block = cn('account-usage-details');

const ROW_CLASS_NAME = block('row');

function AccountUsageDetailsHeader(props: {column: keyof AccountUsageDataItem}) {
    const dispatch = useDispatch();
    const sortOrder = useSelector(getAccountUsageSortStateByColumn);
    const {column} = props;

    const toggleSort = React.useCallback(
        (column: string, nextOrder: OrderType, opts: {multisort?: boolean}) => {
            dispatch(setAccountUsageSortState({column, order: nextOrder}, opts.multisort));
        },
        [dispatch],
    );

    const {order, multisortIndex} = sortOrder[column] || {};

    return (
        <ColumnHeader
            column={column}
            title={readableAccountUsageColumnName(column)}
            order={order}
            sortable={true}
            toggleSort={toggleSort}
            multisortIndex={multisortIndex}
        />
    );
}

const PageCounterMemo = React.memo(PageCounter);

function PathHeader() {
    return (
        <div className={block('path-header')}>
            <AccountUsageDetailsHeader column={'path'} />
            <div className={block('path-header-loader')}>
                <UsageLoaderMemo />
            </div>
            <div className={block('path-header-page')}>
                <PageCounterMemo />
            </div>
        </div>
    );
}

const UsageLoaderMemo = React.memo(UsageLoader);

function useColumnsByPreset(mediums: Array<string>) {
    const dispatch = useDispatch();

    const availableColumns = useSelector(getAccountUsageAvailableColumns);
    const visibleColumns = useSelector(getAccountUsageVisibleDataColumns);
    const cluster = useSelector(getCluster);
    const viewType = useSelector(getAccountUsageViewType);
    const treePath = useSelector(getAccountUsageTreeItemsBasePath);

    const handleAttributeButtonClick = useCallback(
        (accountData: AccountRequestData) => {
            dispatch(openAccountAttributesModal(accountData));
        },
        [dispatch],
    );

    const columnsByName = React.useMemo(() => {
        const res: Map<string, Column<AccountUsageDataItem>> = new Map();

        const iconName =
            viewType === 'tree' || viewType === 'tree-diff'
                ? ''
                : viewType === 'list' || viewType === 'list-diff'
                ? 'list'
                : 'folders';
        res.set('type', {
            name: 'type',
            header: iconName === '' ? null : <Icon awesome={iconName} />,
            sortable: false,
            render(item) {
                const {type, path, acl_status} = item.row;
                return acl_status === 'deny' ? (
                    <Icon face="light" awesome="eye-slash" />
                ) : (
                    <Icon awesome={getIconNameForType(path ? type : '')} />
                );
            },
            width: 50,
        });
        res.set('path', {
            name: 'path',
            header: <PathHeader />,
            sortable: false,
            render(item) {
                const {path} = item.row;
                if (!path) {
                    return <Warning>Permission denied</Warning>;
                }

                return <PathView path={path} lastFragmentOnly={viewType === 'tree'} />;
            },
            onClick: ({row}) => {
                const {path} = row;
                if (
                    !path ||
                    (viewType !== 'tree-diff' && viewType !== 'tree') ||
                    row.type !== 'map_node'
                ) {
                    return;
                }
                dispatch(setAccountUsageDataFilter({treePath: row.path}));
            },
            className: block('path-cell', {view: viewType}),
        });

        res.set('disk_space', {
            name: 'disk_space',
            header: <AccountUsageDetailsHeader column={'disk_space'} />,
            sortable: false,
            render(item) {
                return (
                    <DetailTableCell
                        value={item.row.disk_space}
                        additionalValue={item.row['versioned:disk_space']}
                        viewType={viewType}
                        formatType="bytes"
                    />
                );
            },
            align: 'right',
            width: 120,
        });
        res.set('master_memory', {
            name: 'Master mem',
            header: <AccountUsageDetailsHeader column={'master_memory'} />,
            sortable: false,
            render(item) {
                return (
                    <DetailTableCell
                        value={item.row.master_memory}
                        additionalValue={item.row['versioned:master_memory']}
                        viewType={viewType}
                        formatType="bytes"
                    />
                );
            },
            align: 'right',
            width: 120,
        });
        res.set('owner', {
            name: 'Owner',
            header: <AccountUsageDetailsHeader column={'owner'} />,
            sortable: false,
            render(item) {
                return <UserCard userName={item.row.owner} />;
            },
            width: 120,
        });

        _.forEach(mediums, (medium) => {
            const name = `medium:${medium}` as MediumKeyTemplate;
            const versionedName = `versioned:medium:${name}` as VersionedKeyTemplate;

            res.set(name, {
                name,
                header: <AccountUsageDetailsHeader column={name} />,
                sortable: false,
                render(item) {
                    const additionalValue =
                        versionedName in item.row ? Number(item.row[versionedName]) : null;
                    return (
                        <DetailTableCell
                            value={Number(item.row[name])}
                            additionalValue={additionalValue}
                            viewType={viewType}
                            formatType="bytes"
                        />
                    );
                },
                align: 'right',
                width: 120,
            });
        });

        _.forEach(availableColumns, (field) => {
            if (res.has(field)) {
                return;
            }

            res.set(field, {
                name: field,
                header: <AccountUsageDetailsHeader column={field} />,
                sortable: false,
                render(item) {
                    const {[field]: value} = item.row;
                    const additionalKey = `versioned:${field}` as VersionedKeyTemplate;
                    const additionalValue =
                        additionalKey in item.row ? Number(item.row[additionalKey]) : null;

                    if (typeof value === 'boolean') {
                        return value === undefined ? format.NO_VALUE : _.capitalize(String(value));
                    }
                    if (field.endsWith('_time')) {
                        return value === null || value === undefined
                            ? format.NO_VALUE
                            : format.DateTime(value, {format: 'full'});
                    }
                    if (field.endsWith('_count')) {
                        return (
                            <DetailTableCell
                                value={Number(value)}
                                additionalValue={additionalValue}
                                viewType={viewType}
                                formatType="number"
                            />
                        );
                    }
                },
                align: 'right',
                width: 150,
            });
        });

        return res;
    }, [treePath, viewType, mediums, cluster, availableColumns, dispatch]);

    return React.useMemo(() => {
        const res: Array<Column<AccountUsageDataItem>> = [];
        visibleColumns.forEach((name) => {
            const item = columnsByName.get(name);
            if (item) {
                res.push(item);
            }
        });
        res.push({
            name: 'actions',
            header: '',
            sortable: false,
            render(item) {
                return (
                    <AccountActionsField
                        path={item.row.path}
                        cluster={cluster}
                        account={item.row.account}
                        onAttributeButtonClick={handleAttributeButtonClick}
                    />
                );
            },
            width: 50,
        });
        return res;
    }, [handleAttributeButtonClick, cluster, columnsByName, visibleColumns]);
}

const UPDATE_TIMEOUT = 600000;

function AccountUsageDetailsList() {
    const dispatch = useDispatch();
    const currentSnapshot = useSelector(getAccountUsageCurrentSnapshot);

    const updateFn = React.useCallback(() => {
        dispatch(fetchAccountUsageList());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(getAccountUsageListItems);
    const loading = useSelector(getAccountUsageListLoading);
    const loaded = useSelector(getAccountUsageListLoaded);
    const error = useSelector(getAccountUsageListError);

    const mediums = useSelector(getAccountUsageListMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <ErrorBlock error={error} />;
    }

    return (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={items}
            settings={TABLE_SETTINGS}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
}

function AccountUsageDetailsListDiff() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(fetchAccountUsageListDiff());
    }, [dispatch]);

    const items = useSelector(getAccountUsageListDiffItems);
    const loading = useSelector(getAccountUsageListDiffLoading);
    const loaded = useSelector(getAccountUsageListDiffLoaded);
    const error = useSelector(getAccountUsageListDiffError);

    const mediums = useSelector(getAccountUsageListDiffMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <ErrorBlock error={error} />;
    }

    return (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={items}
            settings={TABLE_SETTINGS}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
}

function AccountUsageDetailsTree() {
    const dispatch = useDispatch();
    const currentSnapshot = useSelector(getAccountUsageCurrentSnapshot);
    const updateFn = React.useCallback(() => {
        dispatch(fetchAccountUsageTree());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(getAccountUsageTreeItems);
    const loading = useSelector(getAccountUsageTreeLoading);
    const loaded = useSelector(getAccountUsageTreeLoaded);
    const error = useSelector(getAccountUsageTreeError);

    const mediums = useSelector(getAccountUsageTreeMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <ErrorBlock error={error} />;
    }

    return (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={items}
            settings={TABLE_SETTINGS_DOUBLE_TOOLBAR}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
}

function AccountUsageDetailsTreeDiff() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(fetchAccountUsageTreeDiff());
    }, [dispatch]);

    const items = useSelector(getAccountUsageTreeDiffItems);
    const loading = useSelector(getAccountUsageTreeDiffLoading);
    const loaded = useSelector(getAccountUsageTreeDiffLoaded);
    const error = useSelector(getAccountUsageTreeDiffError);

    const mediums = useSelector(getAccountUsageTreeDiffMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <ErrorBlock error={error} />;
    }

    return (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={items}
            settings={TABLE_SETTINGS_DOUBLE_TOOLBAR}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
}

const AccountUsageDetailsListMemo = React.memo(AccountUsageDetailsList);
const AccountUsageDetailsListDiffMemo = React.memo(AccountUsageDetailsListDiff);
const AccountUsageDetailsTreeMemo = React.memo(AccountUsageDetailsTree);
const AccountUsageDetailsTreeDiffMemo = React.memo(AccountUsageDetailsTreeDiff);

function AccountUsageDetailsDiff({children}: {children: React.ReactNode}) {
    const isDiffView = useSelector(isAccountsUsageDiffView);
    const from = useSelector(getAccountsUsageDiffFromSnapshot);
    const to = useSelector(getAccountsUsageDiffToSnapshot);

    if (!isDiffView) {
        return <>Unexpected view mode</>;
    }

    if ((!from && !to) || from === to) {
        return (
            <NoContent
                warning={"You don't have any selected snapshot range"}
                hint={
                    <React.Fragment>
                        Please select <Secondary>From</Secondary>, <Secondary>To</Secondary>{' '}
                        snapshots
                    </React.Fragment>
                }
            />
        );
    }

    return <>{children}</>;
}

const AccountUsageDetailsDiffMemo = React.memo(AccountUsageDetailsDiff);

function AccountUsageDetails() {
    const viewType = useSelector(getAccountUsageViewType);

    let diffContent = `${viewType} is not implemented` as React.ReactNode;

    switch (viewType) {
        case 'tree':
            return <AccountUsageDetailsTreeMemo />;
        case 'list-plus-folders':
        case 'list':
            return <AccountUsageDetailsListMemo key={viewType} />;
        case 'list-diff':
        case 'list-plus-folders-diff':
            diffContent = <AccountUsageDetailsListDiffMemo key={viewType} />;
            break;
        case 'tree-diff':
            diffContent = <AccountUsageDetailsTreeDiffMemo />;
            break;
    }

    return <AccountUsageDetailsDiffMemo>{diffContent}</AccountUsageDetailsDiffMemo>;
}

const AccountsUsageDetailsListLoaderMemo = React.memo(AccountsUsageDetailsListLoader);
const AccountsUsageDetailsTreeLoaderMemo = React.memo(AccountsUsageDetailsTreeLoader);

function UsageLoader() {
    const viewType = useSelector(getAccountUsageViewType);

    switch (viewType) {
        case 'list':
        case 'list-plus-folders':
            return <AccountsUsageDetailsListLoaderMemo />;
        case 'tree':
            return <AccountsUsageDetailsTreeLoaderMemo />;
        case 'tree-diff':
            return <AccountsUsageDetailsTreeDiffLoader />;
        case 'list-diff':
        case 'list-plus-folders-diff':
            return <AccountsUsageDetailsListDiffLoader />;
    }
    return null;
}

function AccountsUsageDetailsListLoader() {
    const loading = useSelector(getAccountUsageListLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsTreeLoader() {
    const loading = useSelector(getAccountUsageTreeLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsListDiffLoader() {
    const loading = useSelector(getAccountUsageListDiffLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsTreeDiffLoader() {
    const loading = useSelector(getAccountUsageTreeDiffLoading);
    return <Loader visible={loading} />;
}

function PageCounter() {
    const value = useSelector(getAccountUsagePageIndex);
    const count = useSelector(getAccountUsagePageCount);

    return count > 1 ? (
        <Secondary>
            Page: {Number(value) + 1} / {count}{' '}
        </Secondary>
    ) : null;
}

export default React.memo(AccountUsageDetails);
