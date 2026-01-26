import React, {CSSProperties} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button, Checkbox, Flex, Select} from '@gravity-ui/uikit';

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
import {formatByParams} from '../../../../../shared/utils/format';
import UIFactory from '../../../../UIFactory';

import './VersionSummary.scss';

const block = cn('versions-summary');

type Props = ConnectedProps<typeof connector>;

type State = Readonly<{
    showAll: boolean;
    currentVersions: string[];
    sortOrder?: DT100.SortOrder | DT100.SortOrder[];
}>;

type RenderData = {row: VersionSummaryRow; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

const DEFAULT_VERSIONS = ['error', 'total'];
const BASE_COMPONENTS = ['online', 'offline', 'banned'];

function isSpecialRow(version: string) {
    return DEFAULT_VERSIONS.includes(version);
}

class VersionsSummary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAll: true,
            currentVersions: [],
        };
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {currentVersions, showAll} = this.state;
        const {visibleColumns, checkedHideOffline} = this.props;

        const visibleColumnsNames = visibleColumns.map((col) => col.name);
        const onlineVersions = prevState.currentVersions.filter((version) =>
            visibleColumnsNames.includes(version),
        );

        if (!currentVersions.length && visibleColumns.length && showAll) {
            this.setState((state) => ({...state, currentVersions: visibleColumnsNames}));
        }

        const hideOfflineUpdated = prevProps.checkedHideOffline !== checkedHideOffline;
        if (hideOfflineUpdated && checkedHideOffline) {
            this.setState((state) => ({...state, currentVersions: onlineVersions}));
        }
        // if user unchecked checkbox while all columns was selected
        if (hideOfflineUpdated && !checkedHideOffline && showAll) {
            this.setState((state) => ({...state, currentVersions: visibleColumnsNames}));
        }
    }

    renderType = (data: RenderData) => {
        const type = data.row.type;
        const content = hammer.format['Readable'](type);

        return <span className={block('value')}>{content}</span>;
    };

    renderNumber = (key: string, rowData: RenderData) => {
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
                data-qa="component-amount"
            >
                {content}
            </span>
        );
    };

    makeColumnInfo({type, name}: {type: string; name: string}) {
        return {
            name: name,
            title: name,
            sortable: false,
            render: this.renderNumber.bind(this, type),
            align: 'right' as const,
            header: this.renderHeader(type, name),
        };
    }

    renderHeader(key: string, name: string) {
        const {sortState} = this.props;
        const {column, order} = sortState || {};

        return (
            <ColumnHeader<string>
                column={name}
                title={name}
                shortTitle={name.split('-')[0]}
                onSort={this.handleOnSort}
                order={key === column ? order : ''}
                sortIconSize={14}
            />
        );
    }

    renderSelectFilter = () => {
        return (
            <Flex direction="row">
                <Button view="flat" className={block('filter-button')} onClick={this.handleShowAll}>
                    Show all
                </Button>
                <Button view="flat" className={block('filter-button')} onClick={this.handleReset}>
                    Reset
                </Button>
            </Flex>
        );
    };

    handleOnSort = (column: string, order: string) => {
        const {setVersionsSummarySortState} = this.props;
        const {currentVersions, sortOrder} = this.state;
        // unordered case
        if (sortOrder && !Array.isArray(sortOrder) && sortOrder.order === DataTable.DESCENDING) {
            this.setState((state) => ({...state, sortOrder: [], currentVersions: currentVersions}));
            setVersionsSummarySortState({});
        } else if (order === 'asc') {
            this.setState((state) => ({
                ...state,
                sortOrder: {columnId: column, order: DataTable.ASCENDING},
            }));
            setVersionsSummarySortState({column, order});
        } else if (order === 'desc') {
            this.setState((state) => ({
                ...state,
                sortOrder: {columnId: column, order: DataTable.DESCENDING},
            }));
            setVersionsSummarySortState({column, order});
        }
    };

    handleShowAll = () => {
        const {visibleColumns} = this.props;
        const visibleColumnsNames = visibleColumns.map((col) => col.name);
        this.setState((state) => ({...state, showAll: true, currentVersions: visibleColumnsNames}));
    };

    handleReset = () => {
        this.setState((state) => ({...state, showAll: false, currentVersions: DEFAULT_VERSIONS}));
    };

    handleHideOffline = (value: boolean) => {
        const {changeCheckedHideOffline} = this.props;
        changeCheckedHideOffline(value);
    };

    handleSelectUpdate = (value: string[]) => {
        // move default versions to the end
        const prepareValue = (value: string[]) => {
            return value
                .filter((item) => !DEFAULT_VERSIONS.includes(item))
                .concat(DEFAULT_VERSIONS);
        };
        this.setState((state) => ({
            ...state,
            showAll: false,
            currentVersions: prepareValue(value),
        }));
    };

    prepareSelectOptions = () => {
        const {visibleColumns} = this.props;
        const res = [];
        if (visibleColumns) {
            for (const column of visibleColumns) {
                if (DEFAULT_VERSIONS.includes(column.type)) continue;
                res.push({value: column.type, content: column.type});
            }
        }
        return res;
    };

    /*
     * If the user has not applied any sorting
     * for the first column -> sort the types
     * and append the base components to the end.
     */
    prepareItems = (data: VersionSummaryRow[]) => {
        const {sortOrder} = this.state;
        if (!sortOrder) {
            let newData: VersionSummaryRow[] = [];
            if (!sortOrder && data && data.length) {
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
        // default components order from backennd -> banned, offline, online, ...
        // we need -> ..., online, offline, banned
        return data.reverse();
    };

    render() {
        const {currentVersions, sortOrder} = this.state;
        const {items, loading, loaded, cluster, checkedHideOffline} = this.props;
        const monitoringLink = UIFactory.getVersionMonitoringLink(cluster);

        const columns = [
            {
                name: 'type',
                render: this.renderType,
                sortable: false,
                header: this.renderHeader('type', 'Components'),
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
            ...currentVersions.map((column) => this.makeColumnInfo({type: column, name: column})),
        ];

        return (
            <div className={block()}>
                <div className={block('header-actions')}>
                    <Checkbox
                        title={'Hide offline'}
                        content={'Hide offline'}
                        defaultChecked={checkedHideOffline}
                        onUpdate={this.handleHideOffline}
                    />
                    <Select
                        className={block('versions-select')}
                        options={this.prepareSelectOptions()}
                        onUpdate={this.handleSelectUpdate}
                        filterable
                        // filter out default versions to prevent them from appearing in Select
                        value={currentVersions.filter(
                            (version) => !DEFAULT_VERSIONS.includes(version),
                        )}
                        renderFilter={this.renderSelectFilter}
                        placeholder="Versions"
                        multiple
                    />
                    {monitoringLink && (
                        <Link
                            url={formatByParams(monitoringLink.urlTemplate, {ytCluster: cluster})}
                            target="_blank"
                            className={block('monitoring-link')}
                        >
                            {monitoringLink.title || 'Monitoring'}{' '}
                            <Icon awesome="external-link" size={14} />
                        </Link>
                    )}
                </div>
                <DataTableYT
                    className={block('table')}
                    loaded={loaded}
                    loading={loading}
                    data={this.prepareItems(items)}
                    columns={columns}
                    theme={'versions'}
                    settings={SETTINGS}
                    sortOrder={sortOrder}
                />
            </div>
        );
    }

    onClick = (key: string, data: RenderData) => {
        const {changeVersionStateTypeFilters} = this.props;
        const {row} = data;
        const isSpecial = isSpecialRow(key);
        const version = !isSpecial ? key : undefined;
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
