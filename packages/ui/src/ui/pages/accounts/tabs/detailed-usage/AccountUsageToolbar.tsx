import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import cn from 'bem-cn-lite';

import {Breadcrumbs, Link} from '@gravity-ui/uikit';

import format from '../../../../common/hammer/format';
import {useDispatch, useSelector} from 'react-redux';
import {
    fetchAccountUsage,
    fetchAccountsUsageSnapshots,
    setAccountUsageDataFilter,
    setAccountUsageDataPageIndex,
    setAccountUsageViewType,
} from '../../../../store/actions/accounts/account-usage';
import {getCluster} from '../../../../store/selectors/global';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Select from '../../../../components/Select/Select';
import {
    getAccountUsageCurrentSnapshot,
    getAccountUsageDateRangeFilter,
    getAccountUsageDateRangeTypeFilter,
    getAccountUsageOwnerFilter,
    getAccountUsagePageCount,
    getAccountUsagePageIndex,
    getAccountUsagePathFilter,
    getAccountUsageSnapshots,
    getAccountUsageTreeItemsBasePathSplitted,
    getAccountUsageViewType,
    getAccountsUsageDiffFromSnapshot,
    getAccountsUsageDiffToSnapshot,
    isAccountsUsageDiffView,
} from '../../../../store/selectors/accounts/account-usage';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Secondary, SecondaryBold} from '../../../../components/Text/Text';
import SimplePagination from '../../../../components/Pagination/SimplePagination';
import Icon from '../../../../components/Icon/Icon';
import AccountUsageColumnsButton from './AccountUsageColumnsButton';
import {SubjectCard} from '../../../../components/SubjectLink/SubjectLink';
import Suggest, {SuggestItem} from '../../../../components/Suggest/Suggest';
import {Datepicker, DatepickerOutputDates} from '../../../../components/common/Datepicker';
import {PathFragment} from '../../../../containers/PathFragment/PathFragment';
import {useAllUserNamesFiltered} from '../../../../hooks/global';
import {useUpdater} from '../../../../hooks/use-updater';

import './AccountUsageToolbar.scss';
import {getAppBrowserHistory, makeRoutedURL} from '../../../../store/window-store';

const block = cn('account-usage-toolbar');

function useFetchSnapshots() {
    const dispatch = useDispatch();
    const cluster = useSelector(getCluster);

    const updateFn = React.useCallback(() => {
        dispatch(fetchAccountsUsageSnapshots(cluster));
    }, [dispatch, cluster]);

    useUpdater(updateFn, {timeout: 5 * 60000});
}

const SnapshotFilterMemo = React.memo(SnapshotFilter);
const PathFilterMemo = React.memo(PathFilter);
const OwnerFilterMemo = React.memo(OwnerFilter);
const DateRangeFilterMemo = React.memo(DateRangeFilter);
const DateRangeTypeFilterMemo = React.memo(DateRangeTypeFilter);
const PaginationFilterMemo = React.memo(PaginationFilter);
const ViewTypeMemo = React.memo(ViewType);
const UsageBreadcrumbsMemo = React.memo(UsageBreadcrumbs);
const SnapshotDiffFilterMemo = React.memo(SnapshotDiffFilter);

function AccountUsageToolbar() {
    const viewType = useSelector(getAccountUsageViewType);
    const isDiffView = useSelector(isAccountsUsageDiffView);

    return (
        <div>
            <Toolbar
                className={block()}
                itemsToWrap={[
                    {
                        name: 'page',
                        node: <PaginationFilterMemo />,
                    },
                    {
                        name: 'pathFilter',
                        wrapperClassName: block('item'),
                        node: <PathFilterMemo />,
                        shrinkable: true,
                    },
                    {
                        name: 'ownerFilter',
                        wrapperClassName: block('item'),
                        node: <OwnerFilterMemo />,
                        shrinkable: true,
                    },
                    {
                        name: 'dateRangeFilter',
                        wrapperClassName: block('item'),
                        node: <DateRangeFilterMemo />,
                    },
                    {
                        name: 'columns',
                        node: <AccountUsageColumnsButton />,
                    },
                    {
                        name: 'viewType',
                        node: <ViewTypeMemo />,
                    },
                    isDiffView
                        ? {
                              name: 'snapshots',
                              wrapperClassName: block('item'),
                              growable: true,
                              node: <SnapshotDiffFilterMemo />,
                          }
                        : {
                              name: 'snapshotsDiff',
                              wrapperClassName: block('item'),
                              growable: true,
                              node: <SnapshotFilterMemo />,
                          },
                ]}
            >
                {(viewType === 'tree' || viewType === 'tree-diff') && (
                    <Toolbar
                        itemsToWrap={[
                            {
                                node: <UsageBreadcrumbsMemo />,
                            },
                        ]}
                    />
                )}
            </Toolbar>
        </div>
    );
}

const UNDEFINED_SNAPSHOT = '_';

function string2snapshot(v: string) {
    return v === UNDEFINED_SNAPSHOT ? undefined : Number(v);
}

function snapshot2string(v?: number) {
    return v === undefined ? UNDEFINED_SNAPSHOT : String(v);
}

function useSnapshotItems() {
    const snapshots = useSelector(getAccountUsageSnapshots);

    const items = React.useMemo(() => {
        const res = _.map(_.reverse(snapshots.slice()), (item) => {
            return {
                value: snapshot2string(item),
                text: moment(new Date(item * 1000)).format('YYYY-MM-DD HH:mm'),
            };
        });
        res.splice(0, 0, {value: UNDEFINED_SNAPSHOT, text: 'Latest'});
        return res;
    }, [snapshots]);

    return items;
}

function FromSnapshot() {
    const dispatch = useDispatch();
    const items = useSnapshotItems();
    const value = useSelector(getAccountsUsageDiffFromSnapshot);

    const handleChange = React.useCallback(
        (value: string) => {
            dispatch(
                setAccountUsageDataFilter({
                    diffFromSnapshot: string2snapshot(value),
                }),
            );
        },
        [dispatch],
    );

    return (
        <Select
            placeholder={'Snapthot...'}
            items={items}
            value={[snapshot2string(value)]}
            onUpdate={(vals) => handleChange(vals[0])}
            width={150}
        />
    );
}

function ToSnapshot() {
    const dispatch = useDispatch();
    const items = useSnapshotItems();
    const value = useSelector(getAccountsUsageDiffToSnapshot);

    const handleChange = React.useCallback(
        (value: string) => {
            dispatch(
                setAccountUsageDataFilter({
                    diffToSnapshot: string2snapshot(value),
                }),
            );
        },
        [dispatch],
    );

    return (
        <Select
            placeholder={'Snapthot...'}
            items={items}
            value={[snapshot2string(value)]}
            onUpdate={(vals) => handleChange(vals[0])}
            width={150}
        />
    );
}

function SnapshotDiffFilter() {
    useFetchSnapshots();

    return (
        <span className={block('snapshots')}>
            <span className={block('spacer')} />
            <span className={block('snapshot-label')}>From</span>
            <FromSnapshot />
            <span className={block('snapshot-label')}>To</span>
            <ToSnapshot />
        </span>
    );
}

function SnapshotFilter() {
    const dispatch = useDispatch();
    useFetchSnapshots();

    const currentSnapshot = useSelector(getAccountUsageCurrentSnapshot);
    const items = useSnapshotItems();

    const handleSnapshotChange = React.useCallback(
        (value: string) => {
            dispatch(
                setAccountUsageDataFilter({
                    currentSnapshot: string2snapshot(value),
                }),
            );
        },
        [dispatch],
    );

    return (
        <span className={block('snapshots')}>
            <span className={block('spacer')} />
            <SecondaryBold>Snapshot&nbsp;</SecondaryBold>
            <Select
                placeholder={'Snapshot...'}
                value={[snapshot2string(currentSnapshot)]}
                items={items}
                onUpdate={(vals) => handleSnapshotChange(vals[0])}
                width={150}
            />
        </span>
    );
}

function PathFilter() {
    const dispatch = useDispatch();

    const filter = useSelector(getAccountUsagePathFilter);

    const handleChange = React.useCallback(
        (pathFilter: string) => {
            dispatch(setAccountUsageDataFilter({pathFilter}));
        },
        [dispatch],
    );

    return (
        <TextInputWithDebounce
            debounce={500}
            value={filter}
            placeholder={'Path regexp...'}
            onUpdate={handleChange}
        />
    );
}

function OwnerFilter() {
    const dispatch = useDispatch();

    const filter = useSelector(getAccountUsageOwnerFilter);

    const handleChange = React.useCallback(
        (item: SuggestItem) => {
            const ownerFilter = 'string' === typeof item ? item : item.value;
            dispatch(setAccountUsageDataFilter({ownerFilter}));
        },
        [dispatch],
    );

    const {getFiltered, allNames} = useAllUserNamesFiltered();

    return (
        <Suggest
            text={filter}
            items={allNames}
            filter={(_items, filter = '') => getFiltered(filter)}
            apply={handleChange}
            placeholder={'Owner...'}
            renderItem={(item) => (
                <span className={block('owner-item')}>
                    <SubjectCard name={'string' === typeof item ? item : item.value} noLink />
                </span>
            )}
            popupClassName={block('owner-popup')}
        />
    );
}

function DateRangeFilter() {
    const dispatch = useDispatch();

    const {from, to} = useSelector(getAccountUsageDateRangeFilter);
    const type = useSelector(getAccountUsageDateRangeTypeFilter);

    const handleChange = React.useCallback(
        (dateRange: DatepickerOutputDates) => {
            dispatch(setAccountUsageDataFilter({dateRange}));
        },
        [dispatch],
    );

    return (
        <span className={block('date-range')}>
            <Datepicker
                from={from}
                to={to}
                min={0}
                max={Date.now() + 3600 * 24 * 1000}
                range={true}
                allowNullableValues={true}
                onUpdate={handleChange}
                className={block('date-range-control')}
                onError={() => {}}
                placeholder={format.Readable(type) + ' range...'}
                pin="round-brick"
            />
            <DateRangeTypeFilterMemo />
        </span>
    );
}

function DateRangeTypeFilter() {
    const dispatch = useDispatch();

    const value = useSelector(getAccountUsageDateRangeTypeFilter);
    const handleChange = React.useCallback(
        (dateRangeType: any) => {
            dispatch(setAccountUsageDataFilter({dateRangeType}));
        },
        [dispatch],
    );

    return (
        <Select
            pin="clear-round"
            value={[value]}
            onUpdate={(vals) => handleChange(vals[0])}
            items={[
                {value: 'creation_time', text: 'Creation'},
                {value: 'modification_time', text: 'Modification'},
            ]}
            width={135}
        />
    );
}

function PaginationFilter() {
    const dispatch = useDispatch();

    const value = useSelector(getAccountUsagePageIndex);
    const pageCount = useSelector(getAccountUsagePageCount);

    const handleChange = React.useCallback(
        (pageIndex: number) => {
            dispatch(setAccountUsageDataPageIndex(pageIndex));
        },
        [dispatch],
    );

    return (
        <SimplePagination
            value={value}
            min={0}
            max={Math.max(0, pageCount - 1)}
            onChange={handleChange}
        />
    );
}

const VIEW_TYPE_ITEMS = [
    {
        value: 'tree' as const,
        text: 'Tree',
        icon: <Icon awesome={'folder-tree'} face={'solid'} />,
    },
    {
        value: 'list' as const,
        text: 'List',
        icon: <Icon awesome={'list'} />,
    },
    {
        value: 'list-plus-folders' as const,
        text: 'List + folders',
        icon: <Icon awesome={'folders'} />,
    },
    {
        value: 'tree-diff' as const,
        text: 'Diff: Tree',
        content: <DiffTitle title={'Tree'} />,
        icon: <Icon awesome={'folder-tree'} face={'solid'} />,
    },
    {
        value: 'list-diff' as const,
        text: 'Diff: List',
        content: <DiffTitle title={'List'} />,
        icon: <Icon awesome={'list'} />,
    },
    {
        value: 'list-plus-folders-diff' as const,
        text: 'Diff: List + folders',
        content: <DiffTitle title={'List + folders'} />,
        icon: <Icon awesome={'folders'} />,
    },
];

function DiffTitle({title}: {title: string}) {
    return (
        <React.Fragment>
            <Secondary>Diff: </Secondary>
            {title}
        </React.Fragment>
    );
}

function ViewType() {
    const dispatch = useDispatch();

    const value = useSelector(getAccountUsageViewType);
    const handleChange = React.useCallback(
        (value: string) => {
            dispatch(setAccountUsageViewType(value as any));
        },
        [dispatch],
    );

    return (
        <Select
            value={value ? [value] : []}
            items={VIEW_TYPE_ITEMS}
            onUpdate={(vals) => handleChange(vals[0])}
            width="max"
        />
    );
}

export function UsageBreadcrumbs() {
    const dispatch = useDispatch();
    const pathArr = useSelector(getAccountUsageTreeItemsBasePathSplitted);
    const history = getAppBrowserHistory();

    const items = React.useMemo(() => {
        return _.map(pathArr, (item) => {
            return {
                text: item.item,
                value: item.value,
                action: () => {
                    history.push(makeRoutedURL(`${window.location.pathname}?path=${item.value}`));
                    dispatch(fetchAccountUsage());
                },
            };
        });
    }, [pathArr, dispatch, history]);

    return (
        <Breadcrumbs
            items={items}
            firstDisplayedItemsCount={1}
            lastDisplayedItemsCount={1}
            renderRootContent={() => {
                return (
                    <Link view="secondary">
                        <Secondary>
                            <Icon awesome={'folder-tree'} />
                        </Secondary>
                    </Link>
                );
            }}
            renderItemContent={(item) => {
                return (
                    <Link view="secondary">
                        <PathFragment name={item.text} />
                    </Link>
                );
            }}
        />
    );
}

export default React.memo(AccountUsageToolbar);
