import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';
import {useDispatch, useSelector} from 'react-redux';

import {
    fetchAccountUsageList,
    fetchAccountUsageTree,
    setAccountUsageDataFilter,
    setAccountUsageSortState,
} from '../../../../store/actions/accounts/account-usage';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {
    getAccountUsageCurrentSnapshot,
    getAccountsUsageDiffFromSnapshot,
    getAccountsUsageDiffToSnapshot,
    getAccountUsageAvailableColumns,
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
    isAccountsUsageDiffView,
    readableAccountUsageColumnName,
} from '../../../../store/selectors/accounts/account-usage';
import DataTable, {Column, Settings} from '@yandex-cloud/react-data-table';

import ErrorBlock from '../../../../components/Error/Error';
import {
    STICKY_DOUBLE_TOOLBAR_BOTTOM,
    STICKY_TOOLBAR_BOTTOM,
} from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';
import {getCluster} from '../../../../store/selectors/global';
import Loader from '../../../../components/Loader/Loader';

import {Page} from '../../../../../shared/constants/settings';
import {makeRoutedURL} from '../../../../store/location';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import {UserCard} from '../../../../components/UserLink/UserLink';
import {Secondary, Warning} from '../../../../components/Text/Text';
import PathView from '../../../../containers/PathFragment/PathFragment';
import {getIconNameForType} from '../../../../utils/navigation/path-editor';
import {OrderType} from '../../../../utils/sort-helpers';
import Updater from '../../../../utils/hammer/updater';
import {NoContent} from '../../../../components/NoContent/NoContent';
import {AccountUsageDataItem} from '../../../../store/reducers/accounts/usage/account-usage-types';
import {
    fetchAccountUsageListDiff,
    fetchAccountUsageTreeDiff,
} from '../../../../store/actions/accounts/account-usage-diff';

import './AccountUsageDetails.scss';

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

    const {order, index} = sortOrder[column] || {};

    return (
        <ColumnHeader
            column={column}
            title={readableAccountUsageColumnName(column)}
            order={order}
            sortable={true}
            toggleSort={toggleSort}
            multisortIndex={index !== undefined ? index + 1 : index}
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

function renderSign(value?: number) {
    const sign = Math.sign(value!);
    if (!sign || isNaN(sign)) {
        return undefined;
    }
    return sign > 0 ? '+' : '';
}

const SIGN = {
    '+': 'plus' as const,
    '': 'minus' as const,
};

function useColumnsByPreset(mediums: Array<string>) {
    const dispatch = useDispatch();

    const availableColumns = useSelector(getAccountUsageAvailableColumns);
    const visibleColumns = useSelector(getAccountUsageVisibleDataColumns);
    const cluster = useSelector(getCluster);
    const viewType = useSelector(getAccountUsageViewType);
    const treePath = useSelector(getAccountUsageTreeItemsBasePath);

    const {renderBytes, renderNumber} = React.useMemo(() => {
        const diff = viewType.endsWith('-diff');
        return {
            renderBytes(value?: number) {
                const sign = !diff ? undefined : renderSign(value);
                return (
                    <span className={block('value', {diff: SIGN[sign!]})}>
                        {sign}
                        {format.Bytes(value)}
                    </span>
                );
            },
            renderNumber(value?: number) {
                const sign = !diff ? undefined : renderSign(value);
                return (
                    <span className={block('value', {diff: SIGN[sign!]})}>
                        {sign}
                        {format.Number(value)}
                    </span>
                );
            },
        };
    }, [viewType]);

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
                return renderBytes(item.row.disk_space);
            },
            align: 'right',
            width: 120,
        });
        res.set('master_memory', {
            name: 'Master mem',
            header: <AccountUsageDetailsHeader column={'master_memory'} />,
            sortable: false,
            render(item) {
                return renderBytes(item.row.master_memory);
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
            const name: keyof AccountUsageDataItem = `medium:${medium}` as any;
            res.set(name, {
                name,
                header: <AccountUsageDetailsHeader column={name} />,
                sortable: false,
                render(item) {
                    const v = item.row[name];
                    return renderBytes(Number(v));
                },
                align: 'right',
                width: 120,
            });
        });

        _.forEach(availableColumns, (field) => {
            if (res.has(field)) {
                return;
            }

            let formatFn: (v: any) => React.ReactNode = (v: any) => v;
            switch (true) {
                case field.endsWith('_time'):
                    formatFn = (v: number) => {
                        return v === null || v === undefined
                            ? format.NO_VALUE
                            : format.DateTime(v, {format: 'full'});
                    };
                    break;
                case field.endsWith('_count'):
                    formatFn = renderNumber;
                    break;
            }

            res.set(field, {
                name: field,
                header: <AccountUsageDetailsHeader column={field} />,
                sortable: false,
                render(item) {
                    const {[field]: value} = item.row;
                    if (typeof value === 'boolean') {
                        return value === undefined ? format.NO_VALUE : _.capitalize(String(value));
                    }
                    return formatFn(value);
                },
                align: 'right',
                width: 150,
            });
        });

        return res;
    }, [treePath, viewType, mediums, cluster, availableColumns, dispatch]);

    const columns = React.useMemo(() => {
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
                return !item.row.path ? null : (
                    <Link
                        theme={'secondary'}
                        url={makeRoutedURL(`/${cluster}/${Page.NAVIGATION}`, {
                            path: item.row.path,
                        })}
                        routed
                        routedPreserveLocation
                    >
                        <Tooltip
                            content={
                                <span className={block('no-wrap')}>
                                    Open original path in Navigation
                                </span>
                            }
                            placement={'left'}
                        >
                            <Icon awesome={'folder-tree'} />
                        </Tooltip>
                    </Link>
                );
            },
            width: 50,
        });
        return res;
    }, [columnsByName, visibleColumns]);

    return columns;
}

const updater = new Updater();
const UPDATE_TIMEOUT = 600000;
const LIST_UPDATER_ID = 'AccountUsageDetailsList';
const TREE_UPDATER_ID = 'AccountUsageDetailsTree';

function AccountUsageDetailsList() {
    const dispatch = useDispatch();
    const currentSnapshot = useSelector(getAccountUsageCurrentSnapshot);
    React.useEffect(() => {
        if (currentSnapshot === undefined) {
            updater.add(LIST_UPDATER_ID, () => dispatch(fetchAccountUsageList()), UPDATE_TIMEOUT);
        } else {
            dispatch(fetchAccountUsageList());
        }

        return () => {
            if (currentSnapshot === undefined) {
                updater.remove(LIST_UPDATER_ID);
            }
        };
    }, [dispatch, currentSnapshot]);

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
    React.useEffect(() => {
        if (currentSnapshot === undefined) {
            updater.add(TREE_UPDATER_ID, () => dispatch(fetchAccountUsageTree()), UPDATE_TIMEOUT);
        } else {
            dispatch(fetchAccountUsageTree());
        }

        return () => {
            if (currentSnapshot === undefined) {
                updater.remove(TREE_UPDATER_ID);
            }
        };
    }, [dispatch, currentSnapshot]);

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
