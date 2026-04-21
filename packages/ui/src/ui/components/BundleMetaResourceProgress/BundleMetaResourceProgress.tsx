import React from 'react';
import cn from 'bem-cn-lite';

import forEach_ from 'lodash/forEach';
import reduce_ from 'lodash/reduce';

import hammer from '../../common/hammer';

import {Progress, type ProgressProps} from '@gravity-ui/uikit';
import {MetaTable, type MetaTableItem, Tooltip} from '@ytsaurus/components';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

// 1. Импортируем наш новый хук вместо старой функции
import {useProgressBarColor} from '../../constants/colors';

import {type CPULimits, type MemoryLimits} from '../../store/reducers/tablet_cell_bundles';

import './BundleMetaResourceProgress.scss';

const block = cn('bundle-meta-resource-progress');

type ResourceProgress = {
    data: MemoryLimits | CPULimits;
    limit?: number;
    resourceType: 'Number' | 'vCores' | 'Bytes';
    postfix?: string;
};

// 2. Создаем внутренний React-компонент.
// Именно здесь мы имеем право использовать хуки.
function BundleMetaResourceProgressUI(props: ResourceProgress) {
    const {data, limit, resourceType, postfix = ''} = props;

    // Инициализируем хук генерации цветов
    const getProgressBarColor = useProgressBarColor();

    // Заворачиваем вычисления в useMemo для оптимизации (чтобы не пересчитывать при ререндерах)
    const {progressProps, text, commonTooltip} = React.useMemo(() => {
        return getProgressData(
            {data, limit, resourceType, postfix},
            getProgressBarColor, // передаем метод генерации цвета внутрь чистой функции
        );
    }, [data, limit, resourceType, postfix, getProgressBarColor]);

    return (
        <div className={block()}>
            <Tooltip placement={'bottom'} content={commonTooltip}>
                <Progress className={block('progress')} {...progressProps} text={text} />
            </Tooltip>
        </div>
    );
}

// 3. Оригинальная функция-фабрика остается с той же сигнатурой,
// чтобы не сломать родительский код.
export function BundleMetaResourceProgress(title: string, params: ResourceProgress) {
    return {
        key: title,
        // Отрисовываем наш новый компонент
        value: <BundleMetaResourceProgressUI {...params} />,
    };
}

// 4. Добавляем функцию getProgressBarColor в аргументы
function getProgressData(
    {data, limit, resourceType, postfix}: ResourceProgress,
    getProgressBarColor: (index: number) => string,
) {
    const progressProps: ProgressProps = {
        stack: [],
    };

    const sum = reduce_(data, (acc, v) => acc + Number(v), 0);
    const max = limit ?? sum;

    const text = `${hammer.format[resourceType](sum)} ${postfix}`.trim();
    const metaItems: Array<MetaTableItem> = [];

    forEach_(data, (value, name) => {
        const formattedValue = hammer.format[resourceType](value);

        // Используем переданную функцию для получения цвета
        const color = getProgressBarColor(progressProps.stack.length);
        console.log(color);
        metaItems.push({
            key: name,
            label: (
                <span>
                    <ColorCircle color={color} marginRight />
                    {hammer.format.Readable(name)}
                </span>
            ),
            value: `${formattedValue} ${postfix}`,
        });
        const fraction = (Number(value) / max) * 100;

        progressProps.stack.push({
            color,
            value: fraction,
        });
    });

    const commonTooltip = <MetaTable items={metaItems} />;

    return {progressProps, text, commonTooltip};
}
