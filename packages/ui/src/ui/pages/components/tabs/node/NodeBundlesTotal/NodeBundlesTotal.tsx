import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import {MetaTable, Tooltip} from '@ytsaurus/components';

import {
    selectNodeMemoryUsageTotalRowCache,
    selectNodeMemoryUsageTotalStorePreload,
    selectNodeMemoryUsageTotalTableStatic,
    selectNodeMemoryUsageTotalTabletDynamic,
} from '../../../../../store/selectors/components/node/memory';

// 1. Меняем импорт на наш новый хук
import {useProgressBarColor} from '../../../../../constants/colors';

import './NodeBundlesTotal.scss';

const block = cn('node-bundles-total');

const progressClass = block('progress');

function NodeBundlesTotal() {
    const tabletDynamic = useSelector(selectNodeMemoryUsageTotalTabletDynamic) || {};
    const tabletStatic = useSelector(selectNodeMemoryUsageTotalTableStatic) || {};
    const rowCache = useSelector(selectNodeMemoryUsageTotalRowCache) || {};
    const storePreload = useSelector(selectNodeMemoryUsageTotalStorePreload);

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

// 2. Вместо хардкода готовых цветов, сохраняем нужные "индексы" (seed),
// которые в оригинале соответствовали позициям в массиве (4, 7, 2, 0)
const PREDEFINED_COLOR_INDICES: Partial<Record<keyof TabletDynamicTotalProps['data'], number>> = {
    active: 4,
    backing: 7,
    other: 2,
    passive: 0,
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

    // 3. Инициализируем хук генерации цветов
    const getProgressBarColor = useProgressBarColor();

    const {stack, text, content} = React.useMemo(() => {
        let usageSum = 0;
        const stack = map_(rest, (value, key) => {
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
                    {map_(stack, (item, index) => {
                        const {key} = item;

                        // 4. Проверяем, есть ли для этого ключа зарезервированный индекс
                        const predefinedIndex = PREDEFINED_COLOR_INDICES[key];

                        item.color =
                            predefinedIndex !== undefined
                                ? // Если есть - используем его со смещением 0 (чтобы получить оригинальный seed = 4, 7 и т.д.)
                                  getProgressBarColor(predefinedIndex, 0)
                                : // Если нет - используем фоллбэк из старой логики (index, 8)
                                  getProgressBarColor(index, 8);

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
        // 5. Добавляем getProgressBarColor и другие пропсы в зависимости useMemo
    }, [props.data, hideLimit, limitTooltipTitle, getProgressBarColor]);

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
                    {map_([...stack, {key: 'allCount' as const, theme: 'info'}], ({key, theme}) => {
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
                    })}
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
