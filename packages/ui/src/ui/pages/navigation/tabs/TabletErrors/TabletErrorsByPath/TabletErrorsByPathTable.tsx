import React from 'react';
import {useSelector} from 'react-redux';
import moment from 'moment';
import cn from 'bem-cn-lite';

import ypath from '../../../../../common/thor/ypath';

import {Alert, Flex, Link, Text} from '@gravity-ui/uikit';

import {
    getTabletErrorCountLimitExceeded,
    getTabletErrorsByPathData,
    getTabletErrorsByPathError,
    getTabletErrorsByPathLoaded,
    getTabletErrorsByPathLoading,
    getTabletErrorsByPathPageCount,
    getTabletErrorsByPathPageFilter,
} from '../../../../../store/selectors/navigation/tabs/tablet-errors-by-path';
import {getCluster} from '../../../../../store/selectors/global';
import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import DataTableYT, {
    Column,
    DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT,
} from '../../../../../components/DataTableYT/DataTableYT';
import {YTErrorBlock} from '../../../../../components/Error/Error';
import {Host} from '../../../../../containers/Host/Host';
import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';
import {showErrorPopup} from '../../../../../utils/utils';

const block = cn('yt-tablet-errors-by-path-table');

const countLimitExceededMessage =
    'A maximum of 10000 errors can be displayed for the selected time period. To view more, please adjust the time range';

export function TabletErrorsByPathTable({className}: {className?: string}) {
    const {columns, data, loading, loaded, countLimitExceeded} = useTableColumnsAndData();
    const error = useSelector(getTabletErrorsByPathError);
    return (
        <div className={className}>
            {Boolean(error) && <YTErrorBlock error={error} />}
            {Boolean(countLimitExceeded) && (
                <Alert theme={'info'} message={countLimitExceededMessage} />
            )}
            <DataTableYT
                loading={loading}
                loaded={loaded}
                columns={columns}
                data={data}
                settings={{
                    ...DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT,
                    dynamicRender: false,
                }}
                useThemeYT
            />
        </div>
    );
}

type RowType = Exclude<ReturnType<typeof getTabletErrorsByPathData>, undefined>['errors'][number];

function useTableColumnsAndData() {
    const cluster = useSelector(getCluster);
    const loading = useSelector(getTabletErrorsByPathLoading);
    const loaded = useSelector(getTabletErrorsByPathLoaded);
    const page = useSelector(getTabletErrorsByPathPageFilter);
    const pageCount = useSelector(getTabletErrorsByPathPageCount);
    const countLimitExceeded = useSelector(getTabletErrorCountLimitExceeded);

    const {errors = []} = useSelector(getTabletErrorsByPathData) ?? {};
    const columns = React.useMemo(() => {
        const res: Array<Column<RowType>> = [
            {
                name: 'tablet_id',
                header: (
                    <ColumnHeader
                        column="Tablet Id"
                        title="Tablet ID"
                        loading={loading}
                        pageIndex={page}
                        pageCount={pageCount}
                    />
                ),
                render({row: {tablet_id}}) {
                    return (
                        <Flex className="elements-monospace" alignItems="center">
                            <Text ellipsis variant="inherit">
                                <Link href={`/${cluster}/tablet/${tablet_id}`}>{tablet_id}</Link>
                            </Text>
                            <ClipboardButton text={tablet_id} view="flat-secondary" inlineMargins />
                        </Flex>
                    );
                },
            },
            {
                name: 'method',
                header: <ColumnHeader column="Method" />,
                render({row: {method}}) {
                    return method;
                },
            },
            {
                name: 'host',
                header: <ColumnHeader column="Host" />,
                render({row: {host}}) {
                    return <Host address={host} asTabletNode inlineMargins />;
                },
            },
            {
                name: 'date',
                header: <ColumnHeader column="Date" />,
                render({row: {timestamp}}) {
                    return moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
                },
            },
            {
                name: 'error_message',
                header: <ColumnHeader column="Error message" />,
                className: block('cell-error-msg'),
                render({row: {error}}) {
                    return ypath.getValue(error.message);
                },
            },
            {
                name: 'actions',
                header: null,
                render({row: {error}}) {
                    return (
                        <AttributesButton
                            onClick={() => showErrorPopup(error, {hideOopsMsg: true})}
                        />
                    );
                },
            },
        ];
        return res;
    }, [cluster, page, pageCount, loading]);
    return {data: errors, columns, loading, loaded, countLimitExceeded};
}
