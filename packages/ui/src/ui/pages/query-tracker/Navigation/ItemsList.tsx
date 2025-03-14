import React from 'react';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import './ItemsList.scss';
import cn from 'bem-cn-lite';

const b = cn('yt-qt-navigation-items-list');

type Props<T> = {
    className?: string;
    loading: boolean;
    data: T[];
    render: (rowData: T) => React.ReactNode;
    onClick?: (data: T) => void;
};

export function ItemsList<T>({className, data, loading, render, onClick}: Props<T>) {
    return (
        <DataTableYT
            className={b(null, className)}
            rowClassName={() => b('row')}
            settings={{
                stickyHead: 'moving',
                displayIndices: false,
                sortable: true,
                highlightRows: false,
            }}
            data={data}
            columns={[
                {
                    name: 'name',
                    header: (
                        <ColumnHeader
                            className={b('header')}
                            title="Name"
                            column="name"
                            loading={loading}
                        />
                    ),
                    render: ({row}) => {
                        return render(row);
                    },
                },
            ]}
            useThemeYT
            onRowClick={onClick}
        />
    );
}
