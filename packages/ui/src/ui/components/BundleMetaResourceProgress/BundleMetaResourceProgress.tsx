import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import hammer from '../../common/hammer';

import {Progress, ProgressProps} from '@gravity-ui/uikit';
import {Tooltip} from '../../components/Tooltip/Tooltip';

import {getProgressBarColorByIndex} from '../../constants/colors';

import {CPULimits, MemoryLimits} from '../../store/reducers/tablet_cell_bundles';

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
    const {props, info, commonTooltip} = getProgressData({data, limit, resourceType, postfix});

    return {
        key: title,
        value: (
            <div className={block()}>
                <Tooltip placement={'bottom'} content={commonTooltip}>
                    <Progress className={block('progress')} {...props} />
                </Tooltip>
                <span className={block('info')}>{info}</span>
            </div>
        ),
    };
}

function getProgressData({data, limit, resourceType, postfix}: ResourceProgress) {
    const props: ProgressProps = {
        stack: [],
    };

    const sum = _.reduce(data, (acc, v) => acc + Number(v), 0);
    const max = limit ?? sum;

    const info = `${hammer.format[resourceType](sum)} ${postfix}`.trim();
    const generalTooltipList: string[] = [];

    _.forEach(data, (value, name) => {
        const formattedValue = hammer.format[resourceType](value);
        const content = `${name} - ${formattedValue} ${postfix}`;
        const fraction = (Number(value) / max) * 100;

        generalTooltipList.push(content);

        props.stack.push({
            color: getProgressBarColorByIndex(props.stack.length, 0),
            value: fraction,
        });
    });

    const commonTooltip = renderTooltip(generalTooltipList);

    return {props, info, commonTooltip};
}

function renderTooltip(list: string[]) {
    return (
        <ul className={block('tooltip-list')}>
            {list.map((text, i) => {
                return (
                    <li key={i} className={block('tooltip-item')}>
                        {text}
                    </li>
                );
            })}
        </ul>
    );
}
