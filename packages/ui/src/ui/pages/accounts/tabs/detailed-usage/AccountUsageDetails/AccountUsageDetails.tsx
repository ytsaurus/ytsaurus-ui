import React, {useCallback} from 'react';

import capitalize_ from 'lodash/capitalize';
import forEach_ from 'lodash/forEach';

import cn from 'bem-cn-lite';

import format from '../../../../../common/hammer/format';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {
    fetchAccountUsageList,
    fetchAccountUsageTree,
    openAccountAttributesModal,
    setAccountUsageDataFilter,
    setAccountUsageSortState,
    syncAccountsUsageViewTypeWithSettings,
} from '../../../../../store/actions/accounts/account-usage';
import {
    readableAccountUsageColumnName,
    selectAccountUsageAvailableColumns,
    selectAccountUsageCurrentSnapshot,
    selectAccountUsageListDiffError,
    selectAccountUsageListDiffItems,
    selectAccountUsageListDiffLoaded,
    selectAccountUsageListDiffLoading,
    selectAccountUsageListDiffMediums,
    selectAccountUsageListError,
    selectAccountUsageListItems,
    selectAccountUsageListLoaded,
    selectAccountUsageListLoading,
    selectAccountUsageListMediums,
    selectAccountUsagePageCount,
    selectAccountUsagePageIndex,
    selectAccountUsageSortStateByColumn,
    selectAccountUsageTreeDiffError,
    selectAccountUsageTreeDiffItems,
    selectAccountUsageTreeDiffLoaded,
    selectAccountUsageTreeDiffLoading,
    selectAccountUsageTreeDiffMediums,
    selectAccountUsageTreeError,
    selectAccountUsageTreeItems,
    selectAccountUsageTreeItemsBasePath,
    selectAccountUsageTreeLoaded,
    selectAccountUsageTreeLoading,
    selectAccountUsageTreeMediums,
    selectAccountUsageViewType,
    selectAccountUsageVisibleDataColumns,
    selectAccountsUsageDiffFromSnapshot,
    selectAccountsUsageDiffToSnapshot,
    selectIsAccountsUsageDiffView,
} from '../../../../../store/selectors/accounts/account-usage';
import DataTable, {type Column, type Settings} from '@gravity-ui/react-data-table';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';

import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {
    STICKY_DOUBLE_TOOLBAR_BOTTOM,
    STICKY_TOOLBAR_BOTTOM,
} from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import Icon from '../../../../../components/Icon/Icon';
import {selectCluster} from '../../../../../store/selectors/global';
import Loader from '../../../../../components/Loader/Loader';

import {SubjectCard} from '../../../../../components/SubjectLink/SubjectLink';
import {Secondary, Warning} from '@ytsaurus/components';
import {DataTableYT} from '../../../../../components/DataTableYT';
import {getIconNameForType} from '../../../../../utils/navigation/path-editor';
import {type OrderType} from '../../../../../utils/sort-helpers';
import {NoContent} from '../../../../../components/NoContent';
import {
    type AccountUsageDataItem,
    type MediumKeyTemplate,
    type VersionedKeyTemplate,
} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {
    fetchAccountUsageListDiff,
    fetchAccountUsageTreeDiff,
} from '../../../../../store/actions/accounts/account-usage-diff';
import {useUpdater} from '../../../../../hooks/use-updater';

import './AccountUsageDetails.scss';
import i18n from '../i18n';
import {AccountActionsField, type AccountRequestData} from '../AccountActionsField';
import {DetailTableCell} from '../DetailTableCell';
import {Page} from '../../../../../constants/index';
import PathView from '../../../../../containers/PathFragment/PathFragment';
import {Button, Flex, Icon as GravityIcon, Tooltip} from '@gravity-ui/uikit';
import {makeRoutedURL} from '../../../../../store/location';

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
    const sortOrder = useSelector(selectAccountUsageSortStateByColumn);
    const {column} = props;

    const onSort = React.useCallback(
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
            onSort={onSort}
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

    const availableColumns = useSelector(selectAccountUsageAvailableColumns);
    const visibleColumns = useSelector(selectAccountUsageVisibleDataColumns);
    const cluster = useSelector(selectCluster);
    const viewType = useSelector(selectAccountUsageViewType);
    const treePath = useSelector(selectAccountUsageTreeItemsBasePath);

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
                    return <Warning>{i18n('alert_permission-denied')}</Warning>;
                }

                const url = makeRoutedURL(`/${cluster}/${Page.NAVIGATION}?path=${path}`);
                return (
                    <Flex alignItems="center" gap={1}>
                        <span>
                            <PathView path={path} lastFragmentOnly={viewType === 'tree'} />
                        </span>
                        <Tooltip content={i18n('context_open-original-path')}>
                            <Button
                                className={block('link')}
                                href={url}
                                title={url}
                                view="flat"
                                target="_blank"
                                size="xs"
                            >
                                <GravityIcon data={ArrowUpRightFromSquareIcon} size="14" />
                            </Button>
                        </Tooltip>
                    </Flex>
                );
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
                return <SubjectCard name={item.row.owner} />;
            },
            width: 120,
        });

        forEach_(mediums, (medium) => {
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

        forEach_(availableColumns, (field) => {
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
                        return value === undefined ? format.NO_VALUE : capitalize_(String(value));
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
                        cluster={cluster}
                        row={item.row}
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
    const currentSnapshot = useSelector(selectAccountUsageCurrentSnapshot);

    const updateFn = React.useCallback(() => {
        dispatch(fetchAccountUsageList());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(selectAccountUsageListItems);
    const loading = useSelector(selectAccountUsageListLoading);
    const loaded = useSelector(selectAccountUsageListLoaded);
    const error = useSelector(selectAccountUsageListError);

    const mediums = useSelector(selectAccountUsageListMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <YTErrorBlock error={error} />;
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

    const items = useSelector(selectAccountUsageListDiffItems);
    const loading = useSelector(selectAccountUsageListDiffLoading);
    const loaded = useSelector(selectAccountUsageListDiffLoaded);
    const error = useSelector(selectAccountUsageListDiffError);

    const mediums = useSelector(selectAccountUsageListDiffMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <YTErrorBlock error={error} />;
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
    const currentSnapshot = useSelector(selectAccountUsageCurrentSnapshot);
    const updateFn = React.useCallback(() => {
        dispatch(fetchAccountUsageTree());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(selectAccountUsageTreeItems);
    const loading = useSelector(selectAccountUsageTreeLoading);
    const loaded = useSelector(selectAccountUsageTreeLoaded);
    const error = useSelector(selectAccountUsageTreeError);

    const mediums = useSelector(selectAccountUsageTreeMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <YTErrorBlock error={error} />;
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

    const items = useSelector(selectAccountUsageTreeDiffItems);
    const loading = useSelector(selectAccountUsageTreeDiffLoading);
    const loaded = useSelector(selectAccountUsageTreeDiffLoaded);
    const error = useSelector(selectAccountUsageTreeDiffError);

    const mediums = useSelector(selectAccountUsageTreeDiffMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <YTErrorBlock error={error} />;
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
    const isDiffView = useSelector(selectIsAccountsUsageDiffView);
    const from = useSelector(selectAccountsUsageDiffFromSnapshot);
    const to = useSelector(selectAccountsUsageDiffToSnapshot);

    if (!isDiffView) {
        return <>{i18n('alert_unexpected-view-mode')}</>;
    }

    if ((!from && !to) || from === to) {
        return (
            <NoContent
                warning={i18n('alert_no-selected-snapshot-range')}
                hint={
                    <React.Fragment>
                        {i18n('context_select-snapshot-start')}{' '}
                        <Secondary>{i18n('action_snapshot-from')}</Secondary>,{' '}
                        <Secondary>{i18n('action_snapshot-to')}</Secondary>{' '}
                        {i18n('context_select-snapshot-end')}
                    </React.Fragment>
                }
            />
        );
    }

    return <>{children}</>;
}

const AccountUsageDetailsDiffMemo = React.memo(AccountUsageDetailsDiff);

function AccountUsageDetails() {
    const dispatch = useDispatch();
    const viewType = useSelector(selectAccountUsageViewType);

    React.useEffect(() => {
        dispatch(syncAccountsUsageViewTypeWithSettings());
    }, [dispatch]);

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

    return !viewType ? null : (
        <AccountUsageDetailsDiffMemo>{diffContent}</AccountUsageDetailsDiffMemo>
    );
}

const AccountsUsageDetailsListLoaderMemo = React.memo(AccountsUsageDetailsListLoader);
const AccountsUsageDetailsTreeLoaderMemo = React.memo(AccountsUsageDetailsTreeLoader);

function UsageLoader() {
    const viewType = useSelector(selectAccountUsageViewType);

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
    const loading = useSelector(selectAccountUsageListLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsTreeLoader() {
    const loading = useSelector(selectAccountUsageTreeLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsListDiffLoader() {
    const loading = useSelector(selectAccountUsageListDiffLoading);
    return <Loader visible={loading} />;
}

function AccountsUsageDetailsTreeDiffLoader() {
    const loading = useSelector(selectAccountUsageTreeDiffLoading);
    return <Loader visible={loading} />;
}

function PageCounter() {
    const value = useSelector(selectAccountUsagePageIndex);
    const count = useSelector(selectAccountUsagePageCount);

    return count > 1 ? (
        <Secondary>
            {i18n('field_page')} {Number(value) + 1} / {count}{' '}
        </Secondary>
    ) : null;
}

export default React.memo(AccountUsageDetails);
