import ArrowRightIcon from '@gravity-ui/icons/svgs/arrow-right.svg';
import DataTable, {type Column, type Settings} from '@gravity-ui/react-data-table';
import {Flex, Icon} from '@gravity-ui/uikit';
import {ClipboardButton, Secondary, Tooltip, Warning} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import compact_ from 'lodash/compact';
import React, {type FC} from 'react';
import format from '../../../../../common/hammer/format';
import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import {DataTableYT} from '../../../../../components/DataTableYT';
import Label from '../../../../../components/Label';
import {SubjectCard} from '../../../../../components/SubjectLink/SubjectLink';
import {STICKY_DOUBLE_TOOLBAR_BOTTOM} from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import Link from '../../../../../containers/Link/Link';
import {type AccessLogItem} from '../../../../../store/reducers/navigation/tabs/access-log/access-log';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../store/selectors/global';
import {
    selectAccessLogFilterPagination,
    selectAccessLogItems,
    selectAccessLogLastLoadedFieldSelector,
    selectAccessLogLoaded,
    selectAccessLogLoading,
    selectAccessLogPagesCount,
    selectAccessLogReady,
} from '../../../../../store/selectors/navigation/tabs/access-log';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';
import './AccessLogTable.scss';
import AccountsLogTransactionInfo from '../AccountsLogTransactionInfo/AccountsLogTransactionInfo';
import i18n from './i18n';

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

const PathItem: FC<{
    cluster: string;
    path: string;
}> = ({cluster, path}) => {
    return (
        <span className={block('path-link')}>
            <Link url={genNavigationUrl({cluster, path})} className={block('path-link-link')}>
                {path}
                {''}
            </Link>
            <ClipboardButton text={path} view={'flat-secondary'} />
        </span>
    );
};

function useColumns() {
    const cluster = useSelector(selectCluster);
    const fieldSelector = useSelector(selectAccessLogLastLoadedFieldSelector);
    const columns: Array<Column<AccessLogItem>> = React.useMemo(() => {
        const res: Array<Column<AccessLogItem>> = compact_([
            {
                name: 'Date',
                render({row}) {
                    return <Secondary>{row.instant}</Secondary>;
                },
                header: <DateHeaderMemo />,
            },
            {
                name: 'Method',
                header: i18n('field_method'),
                render({row}) {
                    return row.method;
                },
            },
            {
                name: 'Path',
                header: i18n('field_path'),
                render({row: {path, target_path, original_path, destination_path}}) {
                    if (!path) {
                        return <Secondary>{i18n('alert_path-hidden')}</Secondary>;
                    }
                    return (
                        <div className={block('path')}>
                            <Flex gap={2} direction="column">
                                <PathItem cluster={cluster} path={path} />
                                {destination_path && (
                                    <>
                                        <Icon data={ArrowRightIcon} size={16} />
                                        <PathItem cluster={cluster} path={destination_path} />
                                    </>
                                )}
                            </Flex>
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
                header: i18n('field_user'),
                render({row: {user}}) {
                    return <SubjectCard name={user} />;
                },
            },
            {
                name: 'Type',
                header: i18n('field_type'),
                render({row: {type}}) {
                    return format.ReadableField(type);
                },
            },
            fieldSelector?.scope && {
                name: 'Scope',
                header: i18n('field_scope'),
                render({row: {scope}}) {
                    return format.ReadableField(scope);
                },
            },
            fieldSelector?.user_type && {
                name: 'User type',
                header: i18n('field_user-type'),
                render({row: {user_type}}) {
                    return user_type;
                },
            },
            fieldSelector?.method_group && {
                name: 'Method group',
                header: i18n('field_method-group'),
                render({row: {method_group}}) {
                    return method_group;
                },
            },
            fieldSelector?.transaction_info && {
                name: 'Tx',
                header: i18n('field_transaction-info-short'),
                headerTitle: i18n('field_transaction-info'),
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
    const items = useSelector(selectAccessLogItems);
    const columns = useColumns();

    const loading = useSelector(selectAccessLogLoading);
    const loaded = useSelector(selectAccessLogLoaded);

    const ready = useSelector(selectAccessLogReady);

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
        <Warning>{i18n('alert_maintenance')}</Warning>
    );
}

export default React.memo(AccessLogTable);

function DateHeader() {
    const loading = useSelector(selectAccessLogLoading);
    const {index} = useSelector(selectAccessLogFilterPagination);
    const pageCount = useSelector(selectAccessLogPagesCount);

    return (
        <ColumnHeader
            column="Date"
            title={i18n('field_date')}
            loading={loading}
            pageIndex={index}
            pageCount={pageCount}
        />
    );
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
                        <div>{i18n('context_target-path')}</div>
                    ) : (
                        <div>{i18n('context_original-path')}</div>
                    )}
                </div>
            }
        >
            <Label text={text} capitalize />
        </Tooltip>
    ) : null;
}
