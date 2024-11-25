import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import HelpLink from '../../../../../components/HelpLink/HelpLink';
import SimplePagination from '../../../../../components/Pagination/SimplePagination';
import Select from '../../../../../components/Select/Select';
import {YTTimeline, calcFromTo} from '../../../../../components/common/YTTimeline';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import TextInputWithDebounce from '../../../../../components/TextInputWithDebounce/TextInputWithDebounce';

import {docsUrl} from '../../../../../config';

import {getPath} from '../../../../../store/selectors/navigation';
import {
    getTabletErrorsByPathAllMethods,
    getTabletErrorsByPathMethodsFilter,
    getTabletErrorsByPathPageCount,
    getTabletErrorsByPathPageFilter,
    getTabletErrorsByPathTabletIdFilter,
    getTabletErrorsByPathTimeRange,
} from '../../../../../store/selectors/navigation/tabs/tablet-errors-by-path';
import {tabletErrorsByPathActions} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-by-path';
import {loadTabletErrorsByTablePath} from '../../../../../store/actions/navigation/tabs/tablet-errors/tablet-errors-by-path';
import {getNavigationPathAttributes} from '../../../../../store/selectors/navigation/navigation';
import UIFactory from '../../../../../UIFactory';

import {TabletErrorsByPathTable} from './TabletErrorsByPathTable';

import './TabletErrorsByPath.scss';

const block = cn('yt-tablet-errors-by-path');

export function TabletErrorsRequest() {
    return (
        <WithStickyToolbar
            className={block()}
            doubleHeight
            toolbar={<TabletErrorsRequestToolbar className={block('toolbar')} />}
            content={<TabletErrorsByPathTable className={block('content')} />}
        />
    );
}

export function TabletErrorsRequestToolbar({className}: {className: string}) {
    const dispatch = useDispatch();
    const {
        timeRange: {from, to, shortcutValue},
        tabletIdFilter,
        pageFilter,
        methodsFilter,
    } = useTabletErrorFromApiLoad();
    const pageCount = useSelector(getTabletErrorsByPathPageCount);

    const allMethods = useSelector(getTabletErrorsByPathAllMethods) ?? [];

    return (
        <div className={className}>
            <YTTimeline
                from={from!}
                to={to!}
                shortcut={shortcutValue}
                onUpdate={({from, to, shortcutValue}) => {
                    dispatch(
                        tabletErrorsByPathActions.updateFilter({
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
                                onChange={(pageFilter) => {
                                    dispatch(tabletErrorsByPathActions.updateFilter({pageFilter}));
                                }}
                            />
                        ),
                    },
                    {
                        node: (
                            <TextInputWithDebounce
                                className={block('tablet-id-filter')}
                                value={tabletIdFilter}
                                onUpdate={(value) => {
                                    dispatch(
                                        tabletErrorsByPathActions.updateFilter({
                                            tabletIdFilter: value,
                                        }),
                                    );
                                }}
                                placeholder="Tablet Id filter..."
                            />
                        ),
                    },
                    {
                        node: (
                            <Select
                                multiple
                                label="Methods:"
                                value={methodsFilter}
                                items={allMethods?.map((value) => {
                                    return {value, text: value};
                                })}
                                onUpdate={(v) =>
                                    dispatch(
                                        tabletErrorsByPathActions.updateFilter({
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

function useTabletErrorFromApiLoad() {
    const path = useSelector(getPath);
    const timeRange = useSelector(getTabletErrorsByPathTimeRange);
    const methodsFilter = useSelector(getTabletErrorsByPathMethodsFilter);
    const pageFilter = useSelector(getTabletErrorsByPathPageFilter);
    const {id} = useSelector(getNavigationPathAttributes) ?? {};
    const tabletIdFilter = useSelector(getTabletErrorsByPathTabletIdFilter);

    const dispatch = useDispatch();

    React.useEffect(() => {
        if (!path || !id) {
            return;
        }

        if (timeRange.from === undefined || timeRange.to === undefined) {
            const {from, to} = calcFromTo(timeRange);
            dispatch(
                tabletErrorsByPathActions.updateFilter({timeRangeFilter: {...timeRange, from, to}}),
            );
        } else {
            dispatch(
                loadTabletErrorsByTablePath(pageFilter, {
                    table_id: id,
                    table_path: path,
                    start_timestamp: Math.floor(timeRange.from / 1000),
                    end_timestamp: Math.ceil(timeRange.to / 1000),
                    methods: methodsFilter.length ? methodsFilter : undefined,
                    ...(tabletIdFilter ? {tablet_id: tabletIdFilter} : {}),
                }),
            );
        }
    }, [path, id, timeRange, methodsFilter, pageFilter, tabletIdFilter, dispatch]);
    return {timeRange, methodsFilter, tabletIdFilter, pageFilter};
}
