import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import Select from '../../components/Select/Select';
import SimplePagination from '../../components/Pagination/SimplePagination';
import {Toolbar} from '../../components/WithStickyToolbar/Toolbar/Toolbar';
import {calcFromTo, YTTimeline} from '../../components/common/YTTimeline';

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
import {TABLET_ERRORS_ALL_METHODS} from '../../constants/navigation/tabs/tablet-errors';

const block = cn('yt-tablet-errors-toolbar');

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
                                items={TABLET_ERRORS_ALL_METHODS}
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
