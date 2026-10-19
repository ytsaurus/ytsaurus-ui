import {useMemo} from 'react';

import {LEVEL_OFFSET} from './constants';
import {type TreeItem} from './types';
import {useElementFont} from './useElementFont';

const createCanvasContext = (font: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;

    return ctx;
};

const measureRowWidth = (ctx: CanvasRenderingContext2D, text = '') => {
    const {width} = ctx.measureText(text);

    return Math.max(1, Math.ceil(width));
};

const getMinWidth = (items: TreeItem[], font: string | undefined) => {
    let res = 300;

    if (font) {
        const ctx = createCanvasContext(font);

        for (const item of items) {
            const iconsWidth = item.isLeafNode ? 20 : 20 * 2;
            const width = measureRowWidth(ctx, item.attributes.name);
            res = Math.max(res, width + iconsWidth + item.level * LEVEL_OFFSET);
        }
    }

    return Math.round(res * 1.05);
};

export const useNameColumnMinWidth = (items: TreeItem[], rootElement: HTMLDivElement | null) => {
    const font = useElementFont(rootElement);

    return useMemo(() => getMinWidth(items, font), [items, font]);
};
