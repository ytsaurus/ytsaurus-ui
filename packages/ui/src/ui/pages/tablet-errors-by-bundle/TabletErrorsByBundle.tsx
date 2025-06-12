import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import moment from 'moment';

import {TableMethodErrorsCount} from '../../../shared/tablet-errors-manager';

import format from '../../common/hammer/format';

import ColumnHeader from '../../components/ColumnHeader/ColumnHeader';
import DataTableYT, {
    Column,
    DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT,
} from '../../components/DataTableYT/DataTableYT';
import {YTErrorBlock} from '../../components/Error/Error';
import {
    getTabletErrorsByBundleData,
    getTabletErrorsByBundleError,
    getTabletErrorsByBundleLoaded,
    getTabletErrorsByBundleLoading,
    getTabletErrorsByBundleMethodsFilter,
    getTabletErrorsByBundlePageCount,
    getTabletErrorsByBundlePageFilter,
    getTabletErrorsByBundleTimeRangeFilter,
} from '../../store/selectors/tablet-errors/tablet-errors-by-bundle';

import Link from '../../components/Link/Link';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';
import {makeNavigationLink} from '../../utils/app-url';

import './TabletErrorsByBundle.scss';
import {TabletErrorsByBundleToolbar} from './TabletErrorsByBundleToolbar';

const block = cn('yt-tablet-errors-by-bunlde');

export function TabletErrorsByBundle({bundle}: {bundle: string}) {
    const loaded = useSelector(getTabletErrorsByBundleLoaded);
    const loading = useSelector(getTabletErrorsByBundleLoading);
    const error = useSelector(getTabletErrorsByBundleError);

    const {data, columns} = useTabletErrorsColumns(loading);

    return (
        <WithStickyToolbar
            hideToolbarShadow
            className={block()}
            toolbar={<TabletErrorsByBundleToolbar bundle={bundle} className={block('toolbar')} />}
            doubleHeight={true}
            content={
                <div className={block()}>
                    {Boolean(error) && <YTErrorBlock error={error} />}
                    <DataTableYT
                        className={block('table')}
                        loaded={loaded}
                        loading={loading}
                        columns={columns}
                        data={data}
                        useThemeYT
                        settings={DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT}
                    />
                </div>
            }
        />
    );
}

function useTabletErrorsColumns(loading: boolean) {
    const {
        errors: data = [],
        presented_methods = [],
        all_methods = [],
    } = useSelector(getTabletErrorsByBundleData) ?? {};
    const pageFilter = useSelector(getTabletErrorsByBundlePageFilter);
    const teMethods = useSelector(getTabletErrorsByBundleMethodsFilter);
    const teTime = useSelector(getTabletErrorsByBundleTimeRangeFilter);
    const pageCount = useSelector(getTabletErrorsByBundlePageCount);

    const columns = React.useMemo(() => {
        const res: Array<Column<TableMethodErrorsCount>> = [
            {
                name: 'path',
                header: (
                    <ColumnHeader
                        column="Path"
                        loading={loading}
                        pageIndex={pageFilter}
                        pageCount={pageCount}
                    />
                ),
                render({row}) {
                    return (
                        <Link
                            url={makeNavigationLink({
                                path: row.table_path,
                                teMethods,
                                teTime,
                                navmode: 'tablet_errors',
                                teMode: 'request_errors',
                            })}
                        >
                            {row.table_path}
                        </Link>
                    );
                },
            },
            {
                name: 'dataOfLastError',
                header: <ColumnHeader column="Date of last error" />,
                render({row}) {
                    return moment(row.last_error_timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
                },
                width: 180,
            },
            ...(all_methods ?? presented_methods).map((method) => {
                return {
                    name: `method_${method}`,
                    header: <ColumnHeader column={method} title={method}/>,
                    render({row}) {
                        return format.Number(row.method_counts?.[method]);
                    },
                    align: 'right',
                    width: 140,
                } as Column<TableMethodErrorsCount>;
            }),
        ];

        return res;
    }, [data, loading, teMethods, teTime, pageCount]);

    return {data, columns};
}
