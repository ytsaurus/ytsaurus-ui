import React, {CSSProperties, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Checkbox, Select} from '@gravity-ui/uikit';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import includes_ from 'lodash/includes';

import {RootState} from '../../../../store/reducers';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import * as DT100 from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {
    getHideOfflineValue,
    getSummarySortState,
    getVersions,
    getVersionsSummaryData,
} from '../../../../store/selectors/components/versions/versions_v2-ts';

import hammer from '../../../../common/hammer';

import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';
import {
    changeCheckedHideOffline,
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
} from '../../../../store/actions/components/versions/versions_v2';
import {VersionSummaryRow} from '../../../../store/reducers/components/versions/versions_v2';
import {getCluster} from '../../../../store/selectors/global';
import {formatByParams} from '../../../../utils/format';
import UIFactory from '../../../../UIFactory';

import './VersionSummary.scss';

const block = cn('versions-summary');

type RenderData = {row: VersionSummaryRow; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

const DEFAULT_VERSIONS = ['error', 'total'];
const BASE_COMPONENTS = ['online', 'offline', 'banned'];

function isSpecialRow(version: string) {
    return DEFAULT_VERSIONS.includes(version);
}

function VersionsSummary() {
    const dispatch = useDispatch();

    const loading = useSelector(
        (state: RootState) => state.components.versionsV2.loading as boolean,
    );
    const loaded = useSelector((state: RootState) => state.components.versionsV2.loaded as boolean);
    const cluster = useSelector(getCluster);
    const sortState = useSelector(getSummarySortState);
    const visibleColumns = useSelector(getVersions);
    const items = useSelector(getVersionsSummaryData);
    const checkedHideOffline = useSelector(getHideOfflineValue);

    const dispatchChangeVersionStateTypeFilters = useCallback(
        (payload: any) => dispatch(changeVersionStateTypeFilters(payload)),
        [dispatch],
    );

    const dispatchSetVersionsSummarySortState = useCallback(
        (payload: any) => dispatch(setVersionsSummarySortState(payload)),
        [dispatch],
    );

    const dispatchChangeCheckedHideOffline = useCallback(
        (payload: boolean) => dispatch(changeCheckedHideOffline(payload)),
        [dispatch],
    );

    const [currentVersions, setCurrentVersions] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<DT100.SortOrder | DT100.SortOrder[]>();

    useEffect(() => {
        const visibleColumnsNames = map_(visibleColumns, (col) => col.name);

        if (!currentVersions.length && visibleColumns.length) {
            setCurrentVersions(visibleColumnsNames);
        }
    }, [visibleColumns]);

    useEffect(() => {
        const visibleColumnsNames = map_(visibleColumns, (col) => col.name);
        const onlineVersions = filter_(currentVersions, (version) =>
            includes_(visibleColumnsNames, version),
        );

        if (checkedHideOffline) {
            setCurrentVersions(onlineVersions);
        }
    }, []);

    const onClick = useCallback(
        (key: string, data: RenderData) => {
            const {row} = data;
            const isSpecial = isSpecialRow(key);
            const version = !isSpecial ? key : undefined;
            const type: string | undefined = row.type;

            const state = key === 'error' ? 'error' : undefined;

            if (type === 'online' || type === 'offline') {
                dispatchChangeVersionStateTypeFilters({version, state: state || type});
            } else if (type === 'banned') {
                dispatchChangeVersionStateTypeFilters({version, banned: true});
            } else {
                dispatchChangeVersionStateTypeFilters({version, type, state});
            }
        },
        [dispatchChangeVersionStateTypeFilters],
    );

    const renderNumber = useCallback(
        (key: string, rowData: RenderData) => {
            const {row} = rowData;
            const value = row[key];
            const content = !value ? hammer.format.NO_VALUE : hammer.format['Number'](value);
            const handleClick = !value
                ? undefined
                : () => {
                      onClick(key, rowData);
                  };
            return (
                <span
                    className={block('value', {clickable: Boolean(handleClick)})}
                    onClick={handleClick}
                    title={handleClick ? 'Click to set corresponding filter values' : undefined}
                    data-qa="component-amount"
                >
                    {content}
                </span>
            );
        },
        [onClick],
    );

    const renderType = useCallback((data: RenderData) => {
        const type = data.row.type;
        const content = hammer.format['Readable'](type);

        return <span className={block('value')}>{content}</span>;
    }, []);

    const handleOnSort = useCallback(
        (column: string, order: string) => {
            // unordered case
            if (
                sortOrder &&
                !Array.isArray(sortOrder) &&
                sortOrder.order === DataTable.DESCENDING
            ) {
                setSortOrder([]);
                setCurrentVersions(currentVersions);
                dispatchSetVersionsSummarySortState({});
            } else if (order === 'asc') {
                setSortOrder({columnId: column, order: DataTable.ASCENDING});
                dispatchSetVersionsSummarySortState({column, order});
            } else if (order === 'desc') {
                setSortOrder({columnId: column, order: DataTable.DESCENDING});
                dispatchSetVersionsSummarySortState({column, order});
            }
        },
        [sortOrder, currentVersions, dispatchSetVersionsSummarySortState],
    );

    const renderHeader = useCallback(
        (key: string, name: string) => {
            const {column, order} = sortState || {};

            return (
                <ColumnHeader<string>
                    column={name}
                    title={name}
                    shortTitle={name.split('-')[0]}
                    onSort={handleOnSort}
                    order={key === column ? order : ''}
                />
            );
        },
        [sortState, handleOnSort],
    );

    const makeColumnInfo = useCallback(
        ({type, name}: {type: string; name: string}) => {
            return {
                name: name,
                title: name,
                sortable: false,
                render: (data: RenderData) => renderNumber(type, data),
                align: 'right' as const,
                header: renderHeader(type, name),
            };
        },
        [renderNumber, renderHeader],
    );

    const handleHideOffline = useCallback(
        (value: boolean) => {
            dispatchChangeCheckedHideOffline(value);
        },
        [dispatchChangeCheckedHideOffline],
    );

    const handleSelectUpdate = useCallback((value: string[]) => {
        // move default versions to the end
        const prepareValue = (value: string[]) => {
            return value
                .filter((item) => !DEFAULT_VERSIONS.includes(item))
                .concat(DEFAULT_VERSIONS);
        };
        setCurrentVersions(prepareValue(value));
    }, []);

    const prepareSelectOptions = useCallback(() => {
        const res = [];
        if (visibleColumns) {
            for (const column of visibleColumns) {
                if (DEFAULT_VERSIONS.includes(column.type)) continue;
                res.push({value: column.type, content: column.type});
            }
        }
        return res;
    }, [visibleColumns]);

    /*
     * If the user has not applied any sorting
     * for the first column -> sort the types
     * and append the base components to the end.
     */
    const prepareItems = useCallback(
        (data: VersionSummaryRow[]) => {
            if (!sortOrder) {
                let newData: VersionSummaryRow[] = [];
                if (data && data.length) {
                    newData = [...data]
                        .filter((item) => !BASE_COMPONENTS.includes(item.type))
                        .sort((item1, item2) => item1.type.localeCompare(item2.type));

                    BASE_COMPONENTS.forEach((type) => {
                        const item = data.find((item) => item.type === type);
                        if (item) newData.push(item);
                    });
                }
                return newData;
            }
            // default components order from backend -> banned, offline, online, ...
            // we need -> ..., online, offline, banned
            return data.reverse();
        },
        [sortOrder],
    );

    const monitoringLink = UIFactory.getVersionMonitoringLink(cluster);

    const columns = [
        {
            name: 'type',
            render: renderType,
            sortable: false,
            header: renderHeader('type', 'Components'),
            customStyle: () =>
                ({
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--g-color-base-background)',
                    zIndex: 1,
                    boxShadow: 'inset -1px 0 var(--dark-divider)',
                    width: 'fit-content',
                }) as CSSProperties,
        },
        ...currentVersions.map((column) => makeColumnInfo({type: column, name: column})),
    ];

    console.log({columId: sortState?.column, order: sortState?.order === 'asc' ? 1 : -1});

    return (
        <div className={block()}>
            <div className={block('header-actions')}>
                <Checkbox
                    title={'Hide offline'}
                    content={'Hide offline'}
                    defaultChecked={checkedHideOffline}
                    onUpdate={handleHideOffline}
                />
                <Select
                    className={block('versions-select')}
                    options={prepareSelectOptions()}
                    onUpdate={handleSelectUpdate}
                    filterable
                    // filter out default versions to prevent them from appearing in Select
                    value={currentVersions.filter((version) => !DEFAULT_VERSIONS.includes(version))}
                    defaultValue={[]}
                    placeholder="Versions"
                    multiple
                />
                {monitoringLink && (
                    <Link
                        url={formatByParams(monitoringLink.urlTemplate, {ytCluster: cluster})}
                        target="_blank"
                        className={block('monitoring-link')}
                    >
                        {monitoringLink.title || 'Monitoring'} <Icon awesome="external-link" />
                    </Link>
                )}
            </div>
            <DataTableYT
                className={block('table')}
                loaded={loaded}
                loading={loading}
                data={prepareItems(items)}
                columns={columns}
                theme={'versions'}
                settings={SETTINGS}
                sortOrder={{columId: sortState?.column, order: sortState?.order}}
            />
        </div>
    );
}

export default VersionsSummary;
