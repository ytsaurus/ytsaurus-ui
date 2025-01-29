import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import {Checkbox, Select} from '@gravity-ui/uikit';

import {RootState} from '../../../../store/reducers';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import * as DT100 from '@gravity-ui/react-data-table';
import {
    getHideOfflineValue,
    getSummarySortState,
    getVersionsSummaryData,
    getVersions,
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

import './VersionSummary.scss';

const block = cn('versions-summary');

type Props = ConnectedProps<typeof connector>;
type State = Readonly<{
    currentVersion: string;
}>

type RenderData = {row: VersionSummaryItem; index: number};

const SETTINGS: DT100.Settings = {
    displayIndices: false,
};

function isSpecialRow(version: string) {
    return version === 'error' || version === 'total';
}

class VersionsSummary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentVersion: '',
        }
    }

    componentDidUpdate() {
        if (!this.state.currentVersion && this.props.visibleColumns[0]) {
            this.setState((state) => ({...state, currentVersion: this.props.visibleColumns[0].name}))
        }
    }

    getColumns(): Array<DT100.Column<VersionSummaryItem>> {
        return [];
    }

    renderVersion = (data: RenderData) => {
        const {changeVersionStateTypeFilters} = this.props;
        const type = Object.keys(data.row)[0]
        let content;
        if (type === 'error') {
            content = (
                <React.Fragment>
                    <ClickableText
                        color="primary"
                        onClick={() => {
                            changeVersionStateTypeFilters({state: 'error'});
                        }}
                    >
                        <Icon awesome={'exclamation-triangle'} />{' '}
                        {hammer.format['Readable'](type)}
                    </ClickableText>
                </React.Fragment>
            );
        } else {
            content = hammer.format['Readable'](type);
        }

        return <span className={block('value')}>{content}</span>;
    };

    renderNumber = (key: keyof VersionSummaryItem, rowData: RenderData) => {
        const {row} = rowData;
        const value = Object.values(row)[0];
        
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
        const {currentVersion} = this.state;
        const {visibleColumns} = this.props;

        const columns: Array<DT100.Column<VersionSummaryItem>> = [
            {
                name: 'type',
                render: this.renderVersion,
                sortable: false,
                header: this.renderHeader('type', 'Types'),
            },
            this.makeColumnInfo({type: 'version', name: this.state.currentVersion}),
        ];

        const {items, loading, loaded, cluster, checkedHideOffline} = this.props;
        const monitoringLink = UIFactory.getVersionMonitoringLink(cluster);

        //@ts-ignore
        let newItems = items.filter(item => item[currentVersion]);

        if (newItems[0]) {
            let temp = [];
            //@ts-ignore
            for (const key in newItems[0][currentVersion]) {
                let obj = {};
                // @ts-ignore
                if (newItems[0][this.state.currentVersion][key] && key !== 'version') {
                    // @ts-ignore
                    obj[key] = newItems[0][this.state.currentVersion][key];
                    temp.push(obj);
                }

            }
            newItems = temp;
        }

        const options = (() => {
            let res = [];
            if (visibleColumns) {
                for (let column of visibleColumns) {
                    res.push({value: column.type, content: column.type});
                }
            }
            return res;
        })();

        return (
            <div className={block()}>
                <div className={block('header-actions')}>
                    <Select
                        options={options}
                        // @ts-ignore 
                        onUpdate={(value) => {this.setState((state) => ({...state, currentVersion: value}))}}
                        value={[currentVersion]}
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
                <DataTableYT
                    loaded={loaded}
                    loading={loading}
                    // @ts-ignore 
                    data={newItems}
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
