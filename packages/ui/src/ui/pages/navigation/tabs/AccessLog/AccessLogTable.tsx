import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';

import format from '../../../../common/hammer/format';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import Label from '../../../../components/Label/Label';
import Link from '../../../../components/Link/Link';
import {Secondary, Warning} from '../../../../components/Text/Text';
import {SubjectCard} from '../../../../components/SubjectLink/SubjectLink';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import {STICKY_DOUBLE_TOOLBAR_BOTTOM} from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';

import {
    getAccessLogFilterPagination,
    getAccessLogItems,
    getAccessLogLastLoadedFieldSelector,
    getAccessLogLoaded,
    getAccessLogLoading,
    getAccessLogPagesCount,
    getAccessLogReady,
} from '../../../../store/selectors/navigation/tabs/access-log';
import {AccessLogItem} from '../../../../store/reducers/navigation/tabs/access-log/access-log';
import {getCluster} from '../../../../store/selectors/global';

import {genNavigationUrl} from '../../../../utils/navigation/navigation';

import AccountsLogTransactionInfo from './AccountsLogTransactionInfo';

import './AccessLogTable.scss';

const block = cn('access-log-table');

const DateHeaderMemo = React.memo(DateHeader);

const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_DOUBLE_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
    sortable: false,
};

function useColumns() {
    const cluster = useSelector(getCluster);
    const fieldSelector = useSelector(getAccessLogLastLoadedFieldSelector);
    const columns: Array<Column<AccessLogItem>> = React.useMemo(() => {
        const res: Array<Column<AccessLogItem>> = _.compact([
            {
                name: 'Date',
                render({row}) {
                    return <Secondary>{row.instant}</Secondary>;
                },
                header: <DateHeaderMemo />,
            },
            {
                name: 'Method',
                render({row}) {
                    return row.method;
                },
            },
            {
                name: 'Path',
                render({row: {path, target_path, original_path}}) {
                    if (!path) {
                        return (
                            <Secondary>
                                Path is hidden due to access permission restrictions
                            </Secondary>
                        );
                    }
                    return (
                        <div className={block('path')}>
                            <span className={block('path-link')}>
                                <Link
                                    url={genNavigationUrl({cluster, path})}
                                    className={block('path-link-link')}
                                >
                                    {path}
                                    {''}
                                </Link>
                                <ClipboardButton text={path} view={'flat-secondary'} />
                            </span>
                            {target_path && (
                                <PathTag text="target" cluster={cluster} path={target_path} />
                            )}
                            {original_path && (
                                <PathTag text="original" cluster={cluster} path={original_path} />
                            )}
                        </div>
                    );
                },
            },
            {
                name: 'User',
                render({row: {user}}) {
                    return <SubjectCard name={user} />;
                },
            },
            {
                name: 'Type',
                render({row: {type}}) {
                    return format.ReadableField(type);
                },
            },
            fieldSelector?.scope && {
                name: 'Scope',
                render({row: {scope}}) {
                    return format.ReadableField(scope);
                },
            },
            fieldSelector?.user_type && {
                name: 'User type',
                render({row: {user_type}}) {
                    return user_type;
                },
            },
            fieldSelector?.method_group && {
                name: 'Method group',
                render({row: {method_group}}) {
                    return method_group;
                },
            },
            fieldSelector?.transaction_info && {
                name: 'Tx',
                headerTitle: 'Transaction info',
                render({row: {transaction_info}}) {
                    if (!transaction_info) {
                        return null;
                    }
                    return (
                        <Tooltip
                            placement={'left'}
                            content={<AccountsLogTransactionInfo data={transaction_info} />}
                        >
                            <Label text="Tx" />
                        </Tooltip>
                    );
                },
            },
        ]);
        return res;
    }, [cluster, fieldSelector]);
    return columns;
}

function AccessLogTable() {
    const items = useSelector(getAccessLogItems);
    const columns = useColumns();

    const loading = useSelector(getAccessLogLoading);
    const loaded = useSelector(getAccessLogLoaded);

    const ready = useSelector(getAccessLogReady);

    return ready ? (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={loaded ? items : []}
            useThemeYT
            settings={TABLE_SETTINGS}
        />
    ) : (
        <Warning>The service is under maintenance. Please try again later.</Warning>
    );
}

export default React.memo(AccessLogTable);

function DateHeader() {
    const loading = useSelector(getAccessLogLoading);
    const {index} = useSelector(getAccessLogFilterPagination);
    const pageCount = useSelector(getAccessLogPagesCount);

    return <ColumnHeader column="Date" loading={loading} pageIndex={index} pageCount={pageCount} />;
}

function PathTag({
    text,
    path,
    cluster,
}: {
    text: 'target' | 'original';
    path?: string;
    cluster: string;
}) {
    const isTarget = text === 'target';
    return path ? (
        <Tooltip
            content={
                <div>
                    <Link url={genNavigationUrl({cluster, path})}>{path}</Link>
                    <ClipboardButton text={path} view={'flat-secondary'} />
                    {isTarget ? (
                        <div>
                            The Target directs to the node/attribute that has been accessed by the
                            link from the Path.
                        </div>
                    ) : (
                        <div>The Path has been accessed by the link from the Original.</div>
                    )}
                </div>
            }
        >
            <Label text={text} capitalize />
        </Tooltip>
    ) : null;
}
