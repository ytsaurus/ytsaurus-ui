import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';
import range_ from 'lodash/range';

import DataTable, {Column, DataTableProps} from '@gravity-ui/react-data-table';
export type {Column};
import {NoContent} from './NoContent';
import {useScrollableElementContext} from '../../hooks';

import i18n from './i18n';

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

class DataTableYT<T> extends React.Component<DataTableYtProps<T>> {
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
                    <NoContent padding="regular" warning={noItemsText ?? i18n('no-items')} />
                </div>
            );
        }
        return null;
    }

    renderLoadingSkeleton() {
        const {columns} = this.props;
        return map_(range_(4), (index) => (
            <tr key={index} className={block('tr', {empty: true}, 'data-table__row')}>
                {map_(columns, this.renderEmptyCell)}
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

export function DataTableYTWithScroll<T>({settings, ...props}: DataTableYtProps<T>) {
    const scrollableElement = useScrollableElementContext();

    const settingsWithScrollableElement = React.useMemo(() => {
        return Boolean(scrollableElement) && settings?.dynamicRender
            ? ({
                  ...settings,
                  dynamicRenderScrollParentGetter: () =>
                      scrollableElement ?? (document.body as any),
              } as typeof settings)
            : settings;
    }, [settings, scrollableElement]);

    return <DataTableYT<T> {...props} settings={settingsWithScrollableElement} />;
}
