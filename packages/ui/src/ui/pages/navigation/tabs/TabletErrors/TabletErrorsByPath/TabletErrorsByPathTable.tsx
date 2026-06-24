import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import moment from 'moment';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import ypath from '../../../../../common/thor/ypath';

import {Alert, Button, Flex, Link, Text} from '@gravity-ui/uikit';

import {
    selectTabletErrorCountLimitExceeded,
    selectTabletErrorsByPathData,
    selectTabletErrorsByPathError,
    selectTabletErrorsByPathLoaded,
    selectTabletErrorsByPathLoading,
    selectTabletErrorsByPathPageCount,
    selectTabletErrorsByPathPageFilter,
} from '../../../../../store/selectors/navigation/tabs/tablet-errors-by-path';
import {selectCluster} from '../../../../../store/selectors/global';
import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {Host} from '../../../../../containers/Host/Host';
import {DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT} from '../../../../../components/DataTableYT/constants';
import {ClipboardButton, type Column} from '@ytsaurus/components';
import {DataTableYT} from '../../../../../components/DataTableYT';
import AttributesButton from '../../../../../components/AttributesButton/AttributesButton';
import {showErrorPopup} from '../../../../../utils/utils';

const block = cn('yt-tablet-errors-by-path-table');

const MESSAGES = {
    get countLimitExceeded() {
        return i18n('alert_count-limit-exceeded');
    },
};

export function TabletErrorsByPathTable({className}: {className?: string}) {
    const {columns, data, loading, loaded, countLimitExceeded} = useTableColumnsAndData();
    const error = useSelector(selectTabletErrorsByPathError);
    return (
        <div className={className}>
            {Boolean(error) && <YTErrorBlock error={error} />}
            {Boolean(countLimitExceeded) && (
                <Alert theme={'info'} message={MESSAGES.countLimitExceeded} />
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

type RowType = Exclude<
    ReturnType<typeof selectTabletErrorsByPathData>,
    undefined
>['errors'][number];

function useTableColumnsAndData() {
    const cluster = useSelector(selectCluster);
    const loading = useSelector(selectTabletErrorsByPathLoading);
    const loaded = useSelector(selectTabletErrorsByPathLoaded);
    const page = useSelector(selectTabletErrorsByPathPageFilter);
    const pageCount = useSelector(selectTabletErrorsByPathPageCount);
    const countLimitExceeded = useSelector(selectTabletErrorCountLimitExceeded);

    const {errors = []} = useSelector(selectTabletErrorsByPathData) ?? {};
    const columns = React.useMemo(() => {
        const res: Array<Column<RowType>> = [
            {
                name: 'tablet_id',
                header: (
                    <ColumnHeader
                        column="Tablet id"
                        title={i18n('field_tablet-id')}
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
                header: <ColumnHeader column={i18n('field_method')} />,
                render({row: {method}}) {
                    return method;
                },
            },
            {
                name: 'host',
                header: <ColumnHeader column={i18n('field_host')} />,
                render({row: {host}}) {
                    return <Host address={host} asTabletNode inlineMargins />;
                },
            },
            {
                name: 'date',
                header: <ColumnHeader column={i18n('field_date')} />,
                render({row: {timestamp}}) {
                    return moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
                },
            },
            {
                name: 'error_message',
                header: <ColumnHeader column={i18n('field_error-message')} />,
                className: block('cell-error-msg'),
                render({row: {error}}) {
                    return (
                        <Button
                            onClick={() =>
                                showErrorPopup(error, {hideOopsMsg: true, defaultExpandedCount: 1})
                            }
                        >
                            {ypath.getValue(error.message)}
                        </Button>
                    );
                },
            },
            {
                name: 'actions',
                header: null,
                render({row: {error}}) {
                    return (
                        <AttributesButton
                            onClick={() =>
                                showErrorPopup(error, {hideOopsMsg: true, defaultExpandedCount: 1})
                            }
                        />
                    );
                },
            },
        ];
        return res;
    }, [cluster, page, pageCount, loading]);
    return {data: errors, columns, loading, loaded, countLimitExceeded};
}
