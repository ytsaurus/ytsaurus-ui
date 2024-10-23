import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {calculateShortcutTime} from '../../components/common/Timeline/util';
import Select from '../../components/Select/Select';
import SimplePagination from '../../components/Pagination/SimplePagination';
import {Toolbar} from '../../components/WithStickyToolbar/Toolbar/Toolbar';
import {YTTimeline} from '../../components/common/YTTimeline';

import {
    getTabletErrorsByBundleMethodsFilter,
    getTabletErrorsByBundlePageFilter,
    getTabletErrorsByBundleTimeRangeFilter,
} from '../../store/selectors/tablet-errors/tablet-errors-by-bundle';
import {
    tabletErrorsByBundleActions,
    type TabletErrorsByBundleState,
} from '../../store/reducers/tablet-errors/tablet-errors-by-bundle';
import {loadTabletErrorsByBundle} from '../../store/actions/tablet-errors/tablet-errors-by-bundle';

const block = cn('yt-tablet-errors-toolbar');

const ALL_METHODS = [
    'Execute',
    'Multiread',
    'PullRows',
    'GetTabletInfo',
    'ReadDynamicStore',
    'FetchTabletStores',
    'FetchTableRows',
    'GetOrderedTabletSafeTrimRowCount',
    'Write',
    'Trim',
].map((value) => ({value, text: value}));

export function TabletErrorsToolbar({bundle, className}: {bundle: string; className: string}) {
    const dispatch = useDispatch();

    const methodsFilter = useSelector(getTabletErrorsByBundleMethodsFilter);
    const timeRangeFilter = useSelector(getTabletErrorsByBundleTimeRangeFilter);
    const pageFilter = useSelector(getTabletErrorsByBundlePageFilter);
    const {from, to} = useTabletErrorsLoad(bundle, {methodsFilter, timeRangeFilter, pageFilter});

    return (
        <div className={block(null, className)}>
            <YTTimeline
                from={from}
                to={to}
                shortcut={timeRangeFilter.shortcutValue}
                onUpdate={(data) => {
                    console.log({data});
                    dispatch(tabletErrorsByBundleActions.updateFilter({timeRangeFilter: data}));
                }}
                hasRuler={true}
            />
            <Toolbar
                itemsToWrap={[
                    {
                        node: (
                            <SimplePagination
                                value={pageFilter}
                                min={0}
                                max={100}
                                onChange={(v) => {
                                    dispatch(
                                        tabletErrorsByBundleActions.updateFilter({pageFilter: v}),
                                    );
                                }}
                            />
                        ),
                    },
                    {
                        node: (
                            <Select
                                multiple
                                label="Methods:"
                                value={methodsFilter}
                                items={ALL_METHODS}
                                onUpdate={(v) =>
                                    dispatch(
                                        tabletErrorsByBundleActions.updateFilter({
                                            methodsFilter: v,
                                        }),
                                    )
                                }
                                placeholder="Select..."
                                hasClear
                                maxVisibleValuesTextLength={80}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}

function useTabletErrorsLoad(
    bundle: string,
    {
        timeRangeFilter,
        methodsFilter,
        pageFilter,
    }: Pick<TabletErrorsByBundleState, 'timeRangeFilter' | 'methodsFilter' | 'pageFilter'>,
) {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const {from, to} = calcFromTo(timeRangeFilter);
        dispatch(
            loadTabletErrorsByBundle(pageFilter, {
                tablet_cell_bundle: bundle,
                start_timestamp: Math.floor(from / 1000),
                end_timestamp: Math.ceil(to / 1000),
                methods: methodsFilter.length ? methodsFilter : undefined,
            }),
        );
    }, [bundle, dispatch, timeRangeFilter, methodsFilter, pageFilter]);
    return calcFromTo(timeRangeFilter);
}

function calcFromTo(timeRange: TabletErrorsByBundleState['timeRangeFilter']) {
    const {from = Math.floor(Date.now() - 24 * 3600 * 1000), to = Math.ceil(Date.now())} =
        timeRange.shortcutValue !== undefined
            ? calculateShortcutTime(timeRange.shortcutValue)
            : timeRange;

    return {...timeRange, from, to};
}
