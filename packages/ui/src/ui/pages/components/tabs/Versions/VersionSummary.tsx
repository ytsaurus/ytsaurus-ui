import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import cn from 'bem-cn-lite';

import {RootState} from '../../../../store/reducers';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import * as DT100 from '@yandex-cloud/react-data-table';
import {
    getHideOfflineValue,
    getSummarySortState,
    getVersionsSummaryData,
    VersionsSummaryItem,
} from '../../../../store/selectors/components/versions/versions_v2-ts';

import hammer from '../../../../common/hammer';

import {
    changeCheckedHideOffline,
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
} from '../../../../store/actions/components/versions/version_v2-ts';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';
import {VersionCellWithAction} from './VersionCell';

import './VersionSummary.scss';
import {Checkbox} from '@gravity-ui/uikit';

const block = cn('versions-summary');

type Props = ConnectedProps<typeof connector>;

type RenderData = {row: VersionsSummaryItem; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

function isSpecialRow(version: string) {
    return version === 'error' || version === 'total';
}

class VersionsSummary extends React.Component<Props> {
    getColumns(): Array<DT100.Column<VersionsSummaryItem>> {
        return [];
    }
    renderVersion = ({row: {version}}: RenderData) => {
        const {changeVersionStateTypeFilters} = this.props;
        let content;
        if (version === 'error') {
            content = (
                <React.Fragment>
                    <Link
                        theme={'primary'}
                        onClick={() => {
                            changeVersionStateTypeFilters({state: 'error'});
                        }}
                    >
                        <Icon awesome={'exclamation-triangle'} />{' '}
                        {hammer.format['Readable'](version)}
                    </Link>
                </React.Fragment>
            );
        } else if (version === 'total') {
            content = hammer.format['Readable'](version);
        } else {
            content = (
                <div className={block('version')}>
                    <VersionCellWithAction version={version} />
                </div>
            );
        }

        return <span className={block('value')}>{content}</span>;
    };
    renderNumber = (key: keyof VersionsSummaryItem, rowData: RenderData) => {
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

    makeColumnInfo(
        key: keyof VersionsSummaryItem,
        name: string,
        shortName?: string,
    ): DT100.Column<VersionsSummaryItem> {
        return {
            name: shortName || name,
            title: name,
            sortable: false,
            render: this.renderNumber.bind(this, key),
            align: 'right',
            header: this.renderHeader(key, name, shortName),
        };
    }

    renderHeader(key: keyof VersionsSummaryItem, name: string, shortName?: string) {
        const {sortState, setVersionsSummarySortState} = this.props;
        const {column, order} = sortState || {};
        return (
            <ColumnHeader<typeof key>
                sortable={true}
                column={key}
                title={name}
                shortTitle={shortName || name}
                toggleSort={(column, order) => {
                    setVersionsSummarySortState({column, order});
                }}
                order={key === column ? order : ''}
                withUndefined
            />
        );
    }

    handleHideOffline = (value: boolean) => {
        this.props.changeCheckedHideOffline(value);
    };

    render() {
        const columns: Array<DT100.Column<VersionsSummaryItem>> = [
            {
                name: 'version',
                render: this.renderVersion,
                sortable: false,
                sortAccessor: (row) => row.version,
                header: this.renderHeader('version', 'Versions'),
            },
            this.makeColumnInfo('primary_master', 'Primary Masters', 'Pri Masters'),
            this.makeColumnInfo('secondary_master', 'Secondary masters', 'Sec Masters'),
            this.makeColumnInfo('scheduler', 'Schedulers'),
            this.makeColumnInfo('controller_agent', 'Controller Agents', 'CA'),
            this.makeColumnInfo('node', 'Nodes'),
            this.makeColumnInfo('http_proxy', 'HTTP Proxies'),
            this.makeColumnInfo('rpc_proxy', 'RPC Proxies'),
            this.makeColumnInfo('online', 'Online'),
            this.makeColumnInfo('offline', 'Offline'),
            this.makeColumnInfo('banned', 'Banned'),
        ];

        const {items, loading, loaded, checkedHideOffline} = this.props;

        return (
            <div className={block()}>
                <Checkbox
                    className={'hide-offline-checkbox'}
                    title={'Hide offline'}
                    content={'Hide offline'}
                    defaultChecked={checkedHideOffline}
                    onUpdate={this.handleHideOffline}
                />
                <DataTableYT
                    loaded={loaded}
                    loading={loading}
                    data={items}
                    columns={columns}
                    theme={'versions'}
                    settings={SETTINGS}
                    rowClassName={this.rowClassName}
                />
            </div>
        );
    }

    rowClassName(row: VersionsSummaryItem) {
        return block('row', {special: isSpecialRow(row.version)});
    }

    onClick = (key: keyof VersionsSummaryItem, data: RenderData) => {
        const {changeVersionStateTypeFilters} = this.props;
        const {
            row: {version: rowVersion},
        } = data;
        const isSpecial = isSpecialRow(rowVersion);
        const version = !isSpecial ? rowVersion : undefined;

        const state = rowVersion === 'error' ? 'error' : undefined;

        if (key === 'online' || key === 'offline') {
            changeVersionStateTypeFilters({version, state: state || key});
        } else if (key === 'banned') {
            changeVersionStateTypeFilters({version, banned: true});
        } else {
            changeVersionStateTypeFilters({version, type: key, state});
        }
    };
}

const mapStateToProps = (state: RootState) => {
    const {loading, loaded} = state.components.versionsV2;

    const items = getVersionsSummaryData(state);
    const sortState = getSummarySortState(state);

    return {
        loading: loading as boolean,
        loaded: loaded as boolean,
        items,
        sortState,
        checkedHideOffline: getHideOfflineValue(state),
    };
};

const mapDispatchToProps = {
    changeVersionStateTypeFilters,
    setVersionsSummarySortState,
    changeCheckedHideOffline,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(VersionsSummary);
