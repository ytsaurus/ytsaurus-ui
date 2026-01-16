import React from 'react';
import {YTText} from '../components/Text/Text';
import type {Item} from '../components/Select/Select';

export function getFieldStats<K extends string, T extends Record<K, string>>(
    items: Array<T>,
    field: K,
) {
    type ItemType = T[K];

    const stats = items.reduce(
        (acc, item) => {
            if (acc[item[field]] === undefined) {
                acc[item[field]] = 1;
            } else {
                ++acc[item[field]];
            }
            return acc;
        },
        {} as Record<ItemType, number>,
    );

    return stats;
}

export function statsToSelectItems<T extends string>(stats: Record<T, number>) {
    return Object.keys(stats).reduce(
        (acc, k) => {
            const key = k as T;
            acc.push({value: key, text: <YTText capitalize>{key}</YTText>, count: stats[key]});
            return acc;
        },
        [] as Array<Item<T>>,
    );
}
