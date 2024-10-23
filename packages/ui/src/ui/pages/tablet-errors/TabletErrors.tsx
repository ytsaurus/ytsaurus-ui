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
import Error from '../../components/Error/Error';
import {
    getTabletErrorsByBundle,
    getTabletErrorsByBundleError,
    getTabletErrorsByBundleLoaded,
    getTabletErrorsByBundleLoading,
    getTabletErrorsByBundlePageFilter,
} from '../../store/selectors/tablet-errors/tablet-errors-by-bundle';

import Link from '../../components/Link/Link';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';
import {makeNavigationLink} from '../../utils/app-url';

import './TabletErrors.scss';
import {TabletErrorsToolbar} from './TabletErrorsToolbar';

const block = cn('yt-bundle-tablet-errors');

export function TabletErrors({bundle}: {bundle: string}) {
    const loaded = useSelector(getTabletErrorsByBundleLoaded);
    const loading = useSelector(getTabletErrorsByBundleLoading);
    const error = useSelector(getTabletErrorsByBundleError);

    const {data, columns} = useTabletErrorsColumns(loading);

    return (
        <WithStickyToolbar
            className={block()}
            toolbar={<TabletErrorsToolbar bundle={bundle} className={block('toolbar')} />}
            doubleHeight={true}
            content={
                <div className={block()}>
                    {Boolean(error) && <Error error={error} />}
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
    const {errors: data = []} = useSelector(getTabletErrorsByBundle) ?? {};
    const pageFilter = useSelector(getTabletErrorsByBundlePageFilter);

    const columns = React.useMemo(() => {
        type Method = keyof (typeof data)[number]['method_counts'];
        const errorTypes = new Set<Method>();
        data.forEach((row) => {
            Object.keys(row.method_counts ?? {}).forEach((method) => {
                errorTypes.add(method);
            });
        });

        const res: Array<Column<TableMethodErrorsCount>> = [
            {
                name: 'path',
                header: (
                    <ColumnHeader
                        column="Path"
                        loading={loading}
                        pageIndex={pageFilter}
                        pageCount={100}
                    />
                ),
                render({row}) {
                    return (
                        <Link url={makeNavigationLink({path: row.table_path})}>
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
            ...[...errorTypes.values()].map((method) => {
                return {
                    name: `method_${method}`,
                    header: <ColumnHeader column={method} />,
                    render({row}) {
                        return format.Number(row.method_counts?.[method]) ?? format.NO_VALUE;
                    },
                    align: 'right',
                    width: 140,
                } as Column<TableMethodErrorsCount>;
            }),
        ];

        return res;
    }, [data, loading]);

    return {data, columns};
}
