import React from 'react';
import cn from 'bem-cn-lite';

import forEach_ from 'lodash/forEach';
import reduce_ from 'lodash/reduce';

import hammer from '../../common/hammer';

import {Progress, type ProgressProps} from '@gravity-ui/uikit';
import {MetaTable, type MetaTableItem, Tooltip} from '@ytsaurus/components';
import {ColorCircle} from '../../components/ColorCircle/ColorCircle';

import {getProgressBarColorByIndex} from '../../constants/colors';

import {type CPULimits, type MemoryLimits} from '../../store/reducers/tablet_cell_bundles';

import './BundleMetaResourceProgress.scss';

const block = cn('bundle-meta-resource-progress');

type ResourceProgress = {
    data: MemoryLimits | CPULimits;
    limit?: number;
    resourceType: 'Number' | 'vCores' | 'Bytes';
    postfix?: string;
};

export function BundleMetaResourceProgress(
    title: string,
    {data, limit, resourceType, postfix = ''}: ResourceProgress,
) {
    const {props, text, commonTooltip} = getProgressData({data, limit, resourceType, postfix});

    return {
        key: title,
        value: (
            <div className={block()}>
                <Tooltip placement={'bottom'} content={commonTooltip}>
                    <Progress className={block('progress')} {...props} text={text} />
                </Tooltip>
            </div>
        ),
    };
}

function getProgressData({data, limit, resourceType, postfix}: ResourceProgress) {
    const props: ProgressProps = {
        stack: [],
    };

    const sum = reduce_(data, (acc, v) => acc + Number(v), 0);
    const max = limit ?? sum;

    const text = `${hammer.format[resourceType](sum)} ${postfix}`.trim();
    const metaItems: Array<MetaTableItem> = [];

    forEach_(data, (value, name) => {
        const formattedValue = hammer.format[resourceType](value);
        const color = getProgressBarColorByIndex(props.stack.length);

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

        props.stack.push({
            color,
            value: fraction,
        });
    });

    const commonTooltip = <MetaTable items={metaItems} />;

    return {props, text, commonTooltip};
}
