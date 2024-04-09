import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import DataTable, {Column, DataTableProps, Settings} from '@gravity-ui/react-data-table';
import {NoContent} from '../../components/NoContent/NoContent';
import {STICKY_TOOLBAR_BOTTOM} from '../../components/WithStickyToolbar/WithStickyToolbar';
import {HEADER_HEIGHT} from '../../constants';

import './DataTableYT.scss';

const block = cn('yt-data-table');

export type DataTableYtProps<T> = {
    loaded?: boolean;
    loading?: boolean;
    className?: string;
    disableRightGap?: boolean;
    noItemsText?: string;
} & Omit<DataTableProps<T>, 'theme'> &
    ThemeProps<T>;

type ThemeProps<T> = WithThemeYT | Pick<DataTableProps<T>, 'theme'>;

interface WithThemeYT {
    useThemeYT: true;
}

export const DATA_TABLE_YT_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: HEADER_HEIGHT,
    stickyBottom: 0,
    syncHeadOnResize: true,
    dynamicRender: true,
    sortable: false,
    externalSort: true,
    dynamicRenderScrollParentGetter: () => window as any,
};

export const DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR: Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
};

export default class DataTableYT<T> extends React.Component<DataTableYtProps<T>> {
    private dataTable = React.createRef<DataTable<T>>();

    isEmpty() {
        const {loaded, data} = this.props;
        return loaded && data.length === 0;
    }

    renderEmptyRow = () => {
        const {loaded, loading} = this.props;
        if (loading && !loaded) {
            return this.renderLoadingSkeleton();
        }
        return null;
    };

    renderNoContent() {
        const {loaded, data, noItemsText} = this.props;
        if (loaded && data.length === 0) {
            return (
                <div>
                    <NoContent padding="regular" warning={noItemsText ?? 'No items to display'} />
                </div>
            );
        }
        return null;
    }

    renderLoadingSkeleton() {
        const {columns} = this.props;
        return _.map(_.range(4), (index) => (
            <tr key={index} className={block('tr', {empty: true}, 'data-table__row')}>
                {_.map(columns, this.renderEmptyCell)}
            </tr>
        ));
    }

    renderEmptyCell = (column: Column<T>) => {
        const {name, align} = column;
        return (
            <td key={name} className={block('td', {empty: true}, 'data-table__td')}>
                <div className={block('content', {empty: true, align})}>
                    <div className={block('no-data-placeholder')} />
                </div>
            </td>
        );
    };

    onError = (e: any) => {
        throw e;
    };

    render() {
        const {className, disableRightGap, ...rest} = this.props;

        const {useThemeYT} = rest as WithThemeYT;
        const {theme} = rest as DataTableProps<T>;

        const tableTheme = useThemeYT ? 'yt' : theme;
        return (
            <div className={block({'right-gap': !disableRightGap}, className)}>
                <DataTable
                    ref={this.dataTable}
                    emptyDataMessage=""
                    {...rest}
                    theme={tableTheme}
                    renderEmptyRow={this.renderEmptyRow}
                    onError={this.onError}
                />
                {this.renderNoContent()}
            </div>
        );
    }
}
