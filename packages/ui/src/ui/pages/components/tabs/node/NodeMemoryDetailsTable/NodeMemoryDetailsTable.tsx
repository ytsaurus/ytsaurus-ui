import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Column} from '@gravity-ui/react-data-table';

import {FlatItem} from '../../../../../common/hammer/tree-list';
import Link from '../../../../../components/Link/Link';
import Icon from '../../../../../components/Icon/Icon';
import Button from '../../../../../components/Button/Button';
import ColumnHeader from '../../../../../components/ColumnHeader/ColumnHeader';
import DataTableYT, {
    DATA_TABLE_YT_SETTINGS,
} from '../../../../../components/DataTableYT/DataTableYT';
import {NodeMemoryInfo} from '../../../../../store/selectors/components/node/memory';

import {
    StorePreload,
    TabletDynamicTotal,
    UsageLimitProgress,
} from '../NodeBundlesTotal/NodeBundlesTotal';
import {OrderType} from '../../../../../utils/sort-helpers';
import {SortState} from '../../../../../types';
import {SecondaryBold} from '../../../../../components/Text/Text';

import './NodeMemoryDetailsTable.scss';

const block = cn('node-memory-details-table');

const progressClassName = block('progress');

interface Props {
    items: Array<FlatItem<NodeMemoryInfo, NodeMemoryInfo>>;
    loading?: boolean;
    loaded?: boolean;
    toggleExpand: (v: Props['items'][0]) => void;
    onSort: (sortOrder: Array<SortState>) => void;
    nameColumnTitle: string;
    sortState: Array<SortState>;
}

function NodeMemoryDetailsTable(props: Props) {
    const {items, loading, loaded, toggleExpand, onSort, nameColumnTitle, sortState} = props;

    const toggleSort = React.useCallback((column: string, nextOrder: OrderType) => {
        onSort([{column, order: nextOrder}]);
    }, []);

    const sortStateByName = React.useMemo(() => {
        return _.reduce(
            sortState,
            (acc, item) => {
                const {column, order} = item;
                if (!column || !order) {
                    return acc;
                }
                acc[column] = order;
                return acc;
            },
            {} as Record<string, OrderType>,
        );
    }, [sortState]);

    const columns = React.useMemo(() => {
        function headerProps(name: string, title: string) {
            return {
                name,
                header: (
                    <ColumnHeader
                        onSort={toggleSort}
                        column={name}
                        title={title}
                        order={sortStateByName[name]}
                        allowedOrderTypes={['desc', 'asc']}
                    />
                ),
            };
        }
        const res: Array<Column<(typeof items)[0]>> = [
            {
                ...headerProps('name', nameColumnTitle),
                render: ({row: item}) => {
                    const {
                        name,
                        level,
                        attributes: {isBundle, isCollapsed, url},
                    } = item;
                    return (
                        <React.Fragment>
                            {isBundle && (
                                <Button view={'flat-secondary'}>
                                    <Icon awesome={isCollapsed ? 'angle-right' : 'angle-down'} />
                                </Button>
                            )}
                            <Link
                                className={block('name', {
                                    level: String(level),
                                })}
                                theme={'primary'}
                                url={url}
                                routed
                            >
                                {name}
                            </Link>
                        </React.Fragment>
                    );
                },
            },

            {
                ...headerProps('tabletDynamic', 'Tablet dynamic'),
                render: ({
                    row: {
                        attributes: {tabletDynamic, isBundle, parent},
                    },
                }) => {
                    return (
                        <TabletDynamicTotal
                            data={tabletDynamic}
                            className={progressClassName}
                            hideLimit={!isBundle}
                            limitTooltipTitle={
                                isBundle ? (
                                    ''
                                ) : (
                                    <>
                                        Total <SecondaryBold>{parent}</SecondaryBold> usage
                                    </>
                                )
                            }
                        />
                    );
                },
                align: 'center',
                width: 220,
            },
            {
                ...headerProps('tabletStatic', 'Tablet static'),
                render: ({
                    row: {
                        attributes: {tabletStatic, tabletStaticLimit},
                    },
                }) => {
                    return (
                        <UsageLimitProgress
                            className={progressClassName}
                            usage={tabletStatic}
                            limit={tabletStaticLimit}
                            hideLimit={true}
                        />
                    );
                },
                align: 'center',
                width: 220,
            },
            {
                ...headerProps('rowCache', 'Row cache'),
                render: ({
                    row: {
                        attributes: {rowCache, rowCacheLimit},
                    },
                }) => {
                    return (
                        <UsageLimitProgress
                            className={progressClassName}
                            usage={rowCache}
                            limit={rowCacheLimit}
                            hideLimit={true}
                        />
                    );
                },
                align: 'center',
                width: 220,
            },
            {
                ...headerProps('storePreload', 'Store preload'),
                render: ({
                    row: {
                        attributes: {storePreload},
                    },
                }) => {
                    return <StorePreload data={storePreload} className={progressClassName} />;
                },
                align: 'center',
                width: 220,
            },
        ];
        return res;
    }, [nameColumnTitle, toggleSort, sortStateByName]);

    return (
        <DataTableYT
            loaded={loaded}
            loading={loading}
            data={items}
            columns={columns}
            useThemeYT
            settings={DATA_TABLE_YT_SETTINGS}
            rowClassName={({attributes: {isBundle}}) => {
                return block('row', {
                    bundle: isBundle,
                });
            }}
            onRowClick={(row) => toggleExpand(row)}
        />
    );
}

export default React.memo(NodeMemoryDetailsTable);
