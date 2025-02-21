import React, { CSSProperties } from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Button, Checkbox, Flex, Select} from '@gravity-ui/uikit';

import {RootState} from '../../../../store/reducers';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import * as DT100 from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import {
    getHideOfflineValue,
    getSummarySortState,
    getVersionsSummaryData,
    getVersions,
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
import {VersionSummaryItem} from '../../../../store/reducers/components/versions/versions_v2';
import {getCluster} from '../../../../store/selectors/global';
import {formatByParams} from '../../../../utils/format';
import UIFactory from '../../../../UIFactory';

import './VersionSummary.scss';

const block = cn('versions-summary');

type Props = ConnectedProps<typeof connector>;

type State = Readonly<{
    showAll: boolean,
    currentVersions: string[],
    sortOrder?: {
        order?: DT100.OrderType,
        columnId?: string,
    }
}>

type RenderData = {row: VersionSummaryItem; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

const DEFAULT_COMPONENTS = ['error', 'total'];
const BASE_TYPES = ['online', 'offline', 'banned'];

function isSpecialRow(version: string) {
    return version === 'error' || version === 'total';
}

class VersionsSummary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAll: true,
            currentVersions: [],
        }
    }

    componentDidUpdate() {
        if (!this.state.currentVersions.length && this.props.visibleColumns.length && this.state.showAll) {
            this.setState((state) => ({...state, currentVersions: this.props.visibleColumns.map(col => col.name)}))
        }
    }

    getColumns(): Array<DT100.Column<VersionSummaryItem>> {
        return [];
    }

    renderVersion = (data: RenderData) => {
        const type = data.row.type
        let content = hammer.format['Readable'](type);

        return <span className={block('value')}>{content}</span>;
    };

    renderNumber = (key: keyof VersionSummaryItem, rowData: RenderData) => {
        const {row} = rowData;
        const value = row[key];
        const content = !value ? hammer.format.NO_VALUE : hammer.format['Number'](value);
        const onClick = !value
            ? undefined
            : () => {
                  this.onClick(key, rowData);
              };
        return (
            <span
                className={block('value', {clickable: Boolean(onClick)})}
                onClick={onClick}
                title={onClick ? 'Click to set corresponding filter values' : undefined}
            >
                {content}
            </span>
        );
    };

    makeColumnInfo({
        type,
        name,
        shortName,
    }: {
        type: any;
        name: string;
        shortName?: string;
    }): DT100.Column<VersionSummaryItem> {
        return {
            name: shortName || name,
            title: name,
            sortable: false,
            render: this.renderNumber.bind(this, type),
            align: 'right',
            header: this.renderHeader(type, name, shortName),
        };
    }

    renderHeader(key: keyof VersionSummaryItem, name: string, shortName?: string) {
        const {sortState, setVersionsSummarySortState} = this.props;
        const {column, order} = sortState || {};

        return (
            <ColumnHeader<typeof key>
                column={key}
                title={name}
                shortTitle={shortName || name}
                onSort={(column, order) => {
                    if (this.state.sortOrder && this.state.sortOrder.order === DataTable.DESCENDING) {
                        // @ts-ignore
                        this.setState((state) => ({...state, sortOrder: {}, currentVersions: this.state.currentVersions}));
                        setVersionsSummarySortState({});
                    }else if (order === 'asc') {
                        this.setState((state) => ({...state, sortOrder: {columnId: column, order: DataTable.ASCENDING}}));
                        setVersionsSummarySortState({column, order});
                    } else if (order === 'desc') {
                        this.setState((state) => ({...state, sortOrder: {columnId: column, order: DataTable.DESCENDING}}));
                        setVersionsSummarySortState({column, order});
                    }
                }}
                order={key === column ? order : ''}
            />
        );
    }

    handleHideOffline = (value: boolean) => {
        this.props.changeCheckedHideOffline(value);
    };

    render() {
        const {currentVersions, sortOrder} = this.state;
        const {visibleColumns} = this.props;

        const columns: Array<DT100.Column<VersionSummaryItem>> = [
            {
                name: 'type',
                render: this.renderVersion,
                sortable: false,
                header: this.renderHeader('type', 'Components'),
                customStyle: () =>
                    ({
                        position: 'sticky',
                        left: 0,
                        background: 'inherit',
                        zIndex: 1,
                        boxShadow: 'inset -1px 0 var(--dark-divider)',
                        width: 'fit-content',
                    }) as CSSProperties,
            },
            ...currentVersions.map(column => this.makeColumnInfo({type: column, name: column})),
        ];

        const {items, loading, loaded, cluster, checkedHideOffline} = this.props;
        const monitoringLink = UIFactory.getVersionMonitoringLink(cluster);

        let newItems = items.filter(item => currentVersions.includes(Object.keys(item)[0]));
        const resultItems = [];
        const keys = new Set();
        for (const item of newItems) {
            resultItems.push(...Object.values(item))
        }
        for (const item of resultItems) {
            //@ts-ignore
            for (const key in item) {
                keys.add(key)
            }
        }
        const temp = Array.from(keys);
        const res = {}
        for (const type of temp) {
            if (type === 'version') continue;
            // @ts-ignore
            res[type] = {};
            for (const item of resultItems) {
                // @ts-ignore
                res[type][item['version']] = item[type];
            }
            // @ts-ignore
            res[type]['type'] = type;
        }

        const options = (() => {
            let res = [];
            if (visibleColumns) {
                for (let column of visibleColumns) {
                    if (DEFAULT_COMPONENTS.includes(column.type)) continue;
                    res.push({value: column.type, content: column.type});
                }
            }
            return res;
        })();
        const handleShowAll = () => {
            this.setState((state) => ({...state, showAll: true, currentVersions: visibleColumnsNames}));
        }
        const handleReset = () => {
            this.setState((state) => ({...state, showAll: false, currentVersions: DEFAULT_COMPONENTS}));
        }
        const renderFilter = () => {
            return (
                <Flex direction='row'>
                    <Button view='flat' className={block('filter-button')} onClick={handleShowAll}>Show all</Button>
                    <Button view='flat' className={block('filter-button')} onClick={handleReset}>Reset</Button>
                </Flex>
            )
        };
        const visibleColumnsNames = visibleColumns.map(col => col.name);
        const makeValue = (value: string[]) => {
            return value.filter(item => !DEFAULT_COMPONENTS.includes(item)).concat(DEFAULT_COMPONENTS);
        }
        // @ts-ignore
        const prepareData = (data) => {
            let newData = []
            if (!sortOrder && data && data.length) {
                // @ts-ignore
                newData = [...data].filter(item => !BASE_TYPES.includes(item.type)).toSorted((item1, item2) => item1.type.localeCompare(item2.type));

                BASE_TYPES.forEach((t) => {
                    // @ts-ignore
                    const item = data.find(item => item.type === t);
                    newData.push(item);
                });
            }
            return newData;
        };
        return (
            <div className={block()}>
                <div className={block('header-actions')}>
                    <Select
                        className={block('component-select')}
                        options={options}
                        onUpdate={(value) => {
                            this.setState((state) => ({...state, showAll: false, currentVersions: makeValue(value)}));
                        }}
                        filterable
                        value={currentVersions.filter(version => !DEFAULT_COMPONENTS.includes(version))}
                        renderFilter={renderFilter}
                        placeholder='Versions'
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
                    <Checkbox
                        title={'Hide offline'}
                        content={'Hide offline'}
                        defaultChecked={checkedHideOffline}
                        onUpdate={this.handleHideOffline}
                    />
                </div>
                {/*
                //@ts-ignore */}
                <DataTableYT
                    className={block('table')}
                    loaded={loaded}
                    loading={loading}
                    // @ts-ignore 
                    data={sortOrder ? Object.values(res).reverse() : prepareData(Object.values(res))}
                    columns={columns}
                    theme={'versions'}
                    settings={SETTINGS}
                    rowClassName={this.rowClassName}
                    // @ts-ignore
                    sortOrder={sortOrder}
                />
            </div>
        );
    }

    rowClassName(row: VersionSummaryItem) {
        return block('row', {special: isSpecialRow(row.version)});
    }

    onClick = (key: keyof VersionSummaryItem, data: any) => {
        const {changeVersionStateTypeFilters} = this.props;
        const {
            row,
        } = data;
        const isSpecial = isSpecialRow(key);

        const version = !isSpecial ? key : undefined
        const type: string | undefined = row.type;

        const state = key === 'error' ? 'error' : undefined;

        if (type === 'online' || type === 'offline') {
            changeVersionStateTypeFilters({version, state: state || type});
        } else if (type === 'banned') {
            changeVersionStateTypeFilters({version, banned: true});
        } else {
            changeVersionStateTypeFilters({version, type, state});
        }
    };
}

const mapStateToProps = (state: RootState) => {
    const {loading, loaded} = state.components.versionsV2;
    const cluster = getCluster(state);

    const sortState = getSummarySortState(state);

    const visibleColumns = getVersions(state);
    const items = getVersionsSummaryData(state);

    return {
        loading: loading as boolean,
        loaded: loaded as boolean,
        cluster,
        items,
        sortState,
        checkedHideOffline: getHideOfflineValue(state),
        visibleColumns,
    };
};

const mapDispatchToProps = {
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
    changeCheckedHideOffline,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(VersionsSummary);
