import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import DataTable, {Column, DataTableProps, Settings} from '@gravity-ui/react-data-table';
import {NoItemsMessage} from '../../components/NoItemsMessage/NoItemsMessage';
import {STICKY_TOOLBAR_BOTTOM} from '../../components/WithStickyToolbar/WithStickyToolbar';

import './DataTableYT.scss';

const block = cn('yt-data-table');

export type DataTableYtProps<T> = {
    loaded?: boolean;
    loading?: boolean;
    className?: string;
    disableRightGap?: boolean;
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
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
    dynamicRender: true,
    dynamicRenderScrollParentGetter: () => window as any,
};

export default class DataTableYT<T> extends React.Component<DataTableYtProps<T>> {
    static propTypes = {
        loaded: PropTypes.bool,
        loading: PropTypes.bool,

        // see https://github.com/yandex-cloud/react-data-table
    };

    private dataTable = React.createRef<DataTable<T>>();

    isEmpty() {
        const {loaded, data} = this.props;
        return loaded && data.length === 0;
    }

    renderEmptyRow = () => {
        const {loaded, loading, data} = this.props;
        if (loaded && data.length === 0) {
            return (
                <tr>
                    <td>
                        <NoItemsMessage visible={true} />
                    </td>
                </tr>
            );
        } else if (loading && !loaded) {
            return this.renderLoadingSkeleton();
        }
        return null;
    };

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
            </div>
        );
    }
}
