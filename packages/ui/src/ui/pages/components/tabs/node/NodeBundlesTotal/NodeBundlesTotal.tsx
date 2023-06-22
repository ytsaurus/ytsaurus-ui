import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';

import {
    getNodeMemoryUsageTotalRowCache,
    getNodeMemoryUsageTotalStorePreload,
    getNodeMemoryUsageTotalTableStatic,
    getNodeMemoryUsageTotalTabletDynamic,
} from '../../../../../store/selectors/components/node/memory';
import {
    STACKED_PROGRESS_BAR_COLORS,
    getProgressBarColorByIndex,
} from '../../../../../constants/colors';

import './NodeBundlesTotal.scss';

const block = cn('node-bundles-total');

const progressClass = block('progress');

function NodeBundlesTotal() {
    const tabletDynamic = useSelector(getNodeMemoryUsageTotalTabletDynamic) || {};
    const tabletStatic = useSelector(getNodeMemoryUsageTotalTableStatic) || {};
    const rowCache = useSelector(getNodeMemoryUsageTotalRowCache) || {};
    const storePreload = useSelector(getNodeMemoryUsageTotalStorePreload);

    return (
        <div className={block(null, 'elements-section')}>
            <div className={'elements-heading elements-heading_size_xs'}>Total</div>
            <MetaTable
                items={[
                    {
                        key: 'Tablet dynamic',
                        value: (
                            <TabletDynamicTotal data={tabletDynamic} className={progressClass} />
                        ),
                        className: block('meta-value'),
                    },
                    {
                        key: 'Tablet static',
                        value: <UsageLimitProgress {...tabletStatic} className={progressClass} />,
                    },
                    {
                        key: 'Row cache',
                        value: <UsageLimitProgress {...rowCache} className={progressClass} />,
                    },
                    {
                        key: 'Store preload',
                        value: <StorePreload data={storePreload} className={progressClass} />,
                    },
                ]}
            />
        </div>
    );
}

const COLORS: Partial<Record<keyof TabletDynamicTotalProps['data'], string>> = {
    active: STACKED_PROGRESS_BAR_COLORS[4],
    backing: STACKED_PROGRESS_BAR_COLORS[7],
    other: STACKED_PROGRESS_BAR_COLORS[2],
    passive: STACKED_PROGRESS_BAR_COLORS[0],
};

interface TabletDynamicTotalProps {
    className?: string;
    data: {
        usage?: number;
        limit?: number;
        active?: number;
        backing?: number;
        passive?: number;
        other?: number;
    };
    hideLimit?: boolean;
    limitTooltipTitle?: React.ReactNode;
}

export function TabletDynamicTotal(props: TabletDynamicTotalProps) {
    const {
        className,
        data: {usage, limit, ...rest},
        hideLimit,
        limitTooltipTitle,
    } = props;

    const {stack, text, content} = React.useMemo(() => {
        let usageSum = 0;
        const stack = _.map(rest, (value, key) => {
            usageSum += value || 0;
            const v = (100 * value!) / limit!;
            return {
                value: isNaN(v) ? 0 : v,
                key: key as keyof typeof props.data,
                color: '',
            };
        });

        return {
            stack,
            text: hideLimit
                ? format.Bytes(usage ?? usageSum)
                : `${format.Bytes(usage ?? usageSum)} / ${format.Bytes(limit)}`,
            content: (
                <div className={block('progress-tooltip')}>
                    {_.map(stack, (item, index) => {
                        const {key} = item;
                        item.color = COLORS[key] ?? getProgressBarColorByIndex(index, 8);

                        return (
                            <React.Fragment key={key}>
                                <div
                                    style={{
                                        backgroundColor: item.color,
                                        borderRadius: '50%',
                                        width: '1em',
                                        height: '1em',
                                    }}
                                />
                                <div>{key}</div>
                                <div>{format.Bytes(props.data[key])}</div>
                            </React.Fragment>
                        );
                    })}
                    {limitTooltipTitle && (
                        <React.Fragment>
                            <div />
                            <div>{limitTooltipTitle}</div>
                            <div>{format.Bytes(props.data.limit)}</div>
                        </React.Fragment>
                    )}
                </div>
            ),
        };
    }, [props.data]);

    return (
        <Tooltip content={content} className={className}>
            <Progress stack={stack} text={text} />
        </Tooltip>
    );
}

export function UsageLimitProgress(props: {
    className?: string;
    usage?: number;
    limit?: number;
    hideLimit?: boolean;
}) {
    const {className, usage, limit, hideLimit} = props;
    const text = hideLimit
        ? format.Bytes(usage)
        : `${format.Bytes(usage)} / ${format.Bytes(limit)}`;
    return (
        <div className={className}>
            <Progress value={((usage || 0) / (limit || 0)) * 100} text={text} theme={'info'} />
        </div>
    );
}

export function StorePreload(props: {
    className?: string;
    data: {
        allCount: number;
        pending: number;
        failed: number;
        completed: number;
    };
}) {
    const {
        className,
        data: {allCount, pending, failed, completed},
    } = props;
    const {stack, text, content} = React.useMemo(() => {
        const stack = [
            {
                value: (completed / allCount) * 100,
                theme: 'success' as const,
                key: 'completed' as const,
            },
            {
                value: (pending / allCount) * 100,
                theme: 'default' as const,
                key: 'pending' as const,
            },
            {
                value: (failed / allCount) * 100,
                theme: 'danger' as const,
                key: 'failed' as const,
            },
        ].filter(({value}) => value > 0);
        return {
            stack,
            text: [completed, allCount].join(' / '),
            content: (
                <div className={block('progress-tooltip')}>
                    {_.map(
                        [...stack, {key: 'allCount' as const, theme: 'info'}],
                        ({key, theme}) => {
                            return (
                                <React.Fragment key={key}>
                                    <div
                                        className={block('color-circle', {
                                            theme,
                                        })}
                                    />
                                    <div className={block('progress-tooltip-title')}>
                                        {key === 'allCount' ? 'Total' : key}
                                    </div>
                                    <div>{format.Number(props.data[key])}</div>
                                </React.Fragment>
                            );
                        },
                    )}
                </div>
            ),
        };
    }, [props.data]);

    if (!allCount || isNaN(allCount)) {
        return format.NO_VALUE;
    }

    return (
        <Tooltip className={className} content={content} placement={['top', 'bottom']}>
            <Progress stack={stack} text={text} />
        </Tooltip>
    );
}

export default React.memo(NodeBundlesTotal);
