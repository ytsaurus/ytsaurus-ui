import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {docsUrl} from '../../config';

import HelpLink from '../../components/HelpLink/HelpLink';
import Select from '../../components/Select/Select';
import SimplePagination from '../../components/Pagination/SimplePagination';
import {Toolbar} from '../../components/WithStickyToolbar/Toolbar/Toolbar';
import {calcFromTo, YTTimeline} from '../../components/common/YTTimeline';
import TextInputWithDebounce from '../../components/TextInputWithDebounce/TextInputWithDebounce';

import {
    getTabletErrorsByBundleData,
    getTabletErrorsByBundleMethodsFilter,
    getTabletErrorsByBundlePageCount,
    getTabletErrorsByBundlePageFilter,
    getTabletErrorsByBundleTablePathFilter,
    getTabletErrorsByBundleTimeRangeFilter,
} from '../../store/selectors/tablet-errors/tablet-errors-by-bundle';
import {
    type TabletErrorsByBundleState,
    tabletErrorsByBundleActions,
} from '../../store/reducers/tablet-errors/tablet-errors-by-bundle';
import {loadTabletErrorsByBundle} from '../../store/actions/tablet-errors/tablet-errors-by-bundle';
import UIFactory from '../../UIFactory';

import './TabletErrorsByBundleToolbar.scss';

const block = cn('yt-tablet-errors-by-bundle-toolbar');

export function TabletErrorsByBundleToolbar({
    bundle,
    className,
}: {
    bundle: string;
    className: string;
}) {
    const dispatch = useDispatch();

    const {all_methods = []} = useSelector(getTabletErrorsByBundleData) ?? {};
    const methodsFilter = useSelector(getTabletErrorsByBundleMethodsFilter);
    const timeRangeFilter = useSelector(getTabletErrorsByBundleTimeRangeFilter);
    const pageFilter = useSelector(getTabletErrorsByBundlePageFilter);
    const tablePathFilter = useSelector(getTabletErrorsByBundleTablePathFilter);
    const pageCount = useSelector(getTabletErrorsByBundlePageCount);

    const {from, to} = useTabletErrorsLoad(bundle, {
        methodsFilter,
        timeRangeFilter,
        pageFilter,
        tablePathFilter,
    });

    return (
        <div className={block(null, className)}>
            <YTTimeline
                from={from}
                to={to}
                shortcut={timeRangeFilter.shortcutValue}
                onUpdate={({from, to, shortcutValue}) => {
                    dispatch(
                        tabletErrorsByBundleActions.updateFilter({
                            timeRangeFilter: {from, to, shortcutValue},
                        }),
                    );
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
                                max={Math.max(0, pageCount - 1)}
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
                            <TextInputWithDebounce
                                className={block('path-filter')}
                                placeholder={'Table path...'}
                                value={tablePathFilter}
                                onUpdate={(value) => {
                                    dispatch(
                                        tabletErrorsByBundleActions.updateFilter({
                                            tablePathFilter: value,
                                        }),
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
                                items={all_methods.map((value) => {
                                    return {value, text: value};
                                })}
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
                    {
                        node: docsUrl(
                            <HelpLink url={UIFactory.docsUrls['bundles:tablet-errors']} />,
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
        tablePathFilter,
    }: Pick<
        TabletErrorsByBundleState,
        'timeRangeFilter' | 'methodsFilter' | 'pageFilter' | 'tablePathFilter'
    >,
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
                ...(tablePathFilter ? {table_path: tablePathFilter} : {}),
            }),
        );
    }, [bundle, dispatch, timeRangeFilter, methodsFilter, pageFilter, tablePathFilter]);
    return calcFromTo(timeRangeFilter);
}
