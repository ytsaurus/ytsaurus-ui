import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import {Checkbox} from '@gravity-ui/uikit';

import {RootState} from '../../../../store/reducers';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import * as DT100 from '@gravity-ui/react-data-table';
import {
    getHideOfflineValue,
    getSummarySortState,
    getVersionsSummaryData,
    getVersionsSummaryVisibleColumns,
} from '../../../../store/selectors/components/versions/versions_v2-ts';

import hammer from '../../../../common/hammer';

import {ClickableText} from '../../../../components/ClickableText/ClickableText';
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

import {VersionCellWithAction} from './VersionCell';
import './VersionSummary.scss';

const block = cn('versions-summary');

type Props = ConnectedProps<typeof connector>;

type RenderData = {row: VersionSummaryItem; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

function isSpecialRow(version: string) {
    return version === 'error' || version === 'total';
}

class VersionsSummary extends React.Component<Props> {
    getColumns(): Array<DT100.Column<VersionSummaryItem>> {
        return [];
    }
    renderVersion = ({row: {version}}: RenderData) => {
        const {changeVersionStateTypeFilters} = this.props;
        let content;
        if (version === 'error') {
            content = (
                <React.Fragment>
                    <ClickableText
                        color="primary"
                        onClick={() => {
                            changeVersionStateTypeFilters({state: 'error'});
                        }}
                    >
                        <Icon awesome={'exclamation-triangle'} />{' '}
                        {hammer.format['Readable'](version)}
                    </ClickableText>
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
        type: keyof VersionSummaryItem;
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
        const {visibleColumns} = this.props;
        const columns: Array<DT100.Column<VersionSummaryItem>> = [
            {
                name: 'version',
                render: this.renderVersion,
                sortable: false,
                sortAccessor: (row) => row.version,
                header: this.renderHeader('version', 'Versions'),
            },

            ...visibleColumns.map((item) => this.makeColumnInfo(item)),
        ];

        const {items, loading, loaded, cluster, checkedHideOffline} = this.props;
        const monitoringLink = UIFactory.getVersionMonitoringLink(cluster);

        return (
            <div className={block()}>
                <div className={block('header-actions')}>
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

    rowClassName(row: VersionSummaryItem) {
        return block('row', {special: isSpecialRow(row.version)});
    }

    onClick = (key: keyof VersionSummaryItem, data: RenderData) => {
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
    const cluster = getCluster(state);

    const items = getVersionsSummaryData(state);
    const sortState = getSummarySortState(state);

    const visibleColumns = getVersionsSummaryVisibleColumns(state);

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
