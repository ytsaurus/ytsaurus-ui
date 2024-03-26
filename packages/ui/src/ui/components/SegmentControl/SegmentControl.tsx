import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Link} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';

import './SegmentControl.scss';

export type SegmentControlProps = {
    className?: string;
    items: Array<SegmentControlItem>;
    background?: 'neutral-light';
    gap?: 'small';
};

export type SegmentControlItem = {
    name: string;
    value: boolean | number;
    url?: string;
};

const block = cn('yt-segment-control');

export function SegmentControl({className, background, gap, items}: SegmentControlProps) {
    return (
        <Flex inline className={block({background, gap}, className)}>
            {items.map((item, index) => (
                <SegmentItem key={index} data={item} />
            ))}
        </Flex>
    );
}

function SegmentItem({data}: {data: SegmentControlItem}) {
    return (
        <div className={block('item')}>
            {data.name}
            <SegmentValue {...data} />
        </div>
    );
}

function SegmentValue({value, url}: Pick<SegmentControlItem, 'value' | 'url'>) {
    return (
        <Flex>
            <Value value={value} />
            {Boolean(url) && (
                <Link view="secondary" className={block('link')} target="_blank" href={url}>
                    <Icon awesome="link" />
                </Link>
            )}
        </Flex>
    );
}

function Value({value}: Pick<SegmentControlItem, 'value'>) {
    switch (typeof value) {
        case 'boolean':
            return (
                <span className={block('value', {bool: Boolean(value)})}>
                    {value ? 'True' : 'False'}
                </span>
            );
        default:
            return <span className={block('value')}>{value}</span>;
    }
}
