import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Link} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';
import MetaTable from '../../components/MetaTable/MetaTable';

import './SegmentControl.scss';

export type SegmentControlProps = {
    className?: string;
    groups: Array<Array<SegmentControlItem>>;
    background?: 'neutral-light';
};

export type SegmentControlItem = {
    name: string;
    value: boolean | number;
    url?: string;
};

const block = cn('yt-segment-control');

export function SegmentControl({className, background, groups}: SegmentControlProps) {
    return (
        <Flex inline className={block({background}, className)}>
            {groups.map((items, index) => {
                return <SegmentGroup items={items} key={index} />;
            })}
        </Flex>
    );
}

function SegmentGroup({items}: {items: Array<SegmentControlItem>}) {
    return (
        <MetaTable
            className={block('item')}
            rowGap={4}
            items={items.map((item) => {
                return {key: item.name, value: <SegmentValue value={item.value} url={item.url} />};
            })}
        />
    );
}

function SegmentValue({value, url}: Pick<SegmentControlItem, 'value' | 'url'>) {
    return (
        <Flex>
            <Value value={value} />
            {isValidUrl(url) && (
                <Link view="secondary" className={block('link')} target="_blank" href={url}>
                    <Icon awesome="link" />
                </Link>
            )}
        </Flex>
    );
}

function isValidUrl(url?: string): url is string {
    return Boolean(url);
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
