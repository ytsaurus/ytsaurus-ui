import {type Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';
import React from 'react';
import {DataTableYT} from '../../../components/DataTableYT';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import './AclTableWithToolbar.scss';

const block = cn('yt-acl-table-with-toolbar');

type Props<T> = {
    className?: string;
    title: string;
    noItemsText: string;
    items: Array<T>;
    loading?: boolean;
    loaded: boolean;
    columns: Array<Column<T>>;

    toolbar: React.ReactNode;
};

export function AclTableWithToolbar<T extends AclFlags>({
    className,
    title,
    noItemsText,
    items,
    loading,
    loaded,
    columns,
    toolbar,
}: Props<T>) {
    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <div className="elements-heading elements-heading_size_xs">{title}</div>
                <WithStickyToolbar
                    topMargin="none"
                    bottomMargin="regular"
                    toolbar={toolbar}
                    content={
                        <DataTableYT
                            noItemsText={noItemsText}
                            data={items}
                            loading={loading}
                            loaded={loaded}
                            columns={columns}
                            theme={'yt-borderless'}
                            rowClassName={rowClassNameByFlags}
                            settings={{
                                sortable: false,
                                displayIndices: false,
                            }}
                        />
                    }
                />
            </div>
        </ErrorBoundary>
    );
}

type AclFlags = {
    isUnrecognized?: boolean;
    isDepriving?: boolean;
    isRequested?: boolean;
    isApproved?: boolean;
    isMissing?: boolean;
};

function rowClassNameByFlags(item: AclFlags) {
    const {
        isUnrecognized: unrecognized,
        isDepriving: depriving,
        isRequested: requested,
        isApproved: approved,
        isMissing: missing,
    } = item;
    return block('row', {
        unrecognized: unrecognized || missing,
        depriving,
        requested,
        approved,
    });
}
