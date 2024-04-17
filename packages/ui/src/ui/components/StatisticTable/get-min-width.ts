import {LEVEL_OFFSET} from './StatisticTable';

export function createCanvasContext(font: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.font = font;
    return ctx!;
}

export function mesureRowWidth(ctx: CanvasRenderingContext2D, text = '') {
    const {width} = ctx.measureText(text);
    return Math.max(1, Math.ceil(width));
}

export const getMinWidth = (items: any[], fontFamilies: {regular: string; monospace: string}) => {
    let res = 300;
    const ctx = createCanvasContext(
        `14px / 20.02px "${fontFamilies.regular}", "Helvetica Neue", Arial, Helvetica, sans-serif`,
    );

    for (const item of items) {
        const iconsWidth = item.isLeafNode ? 20 : 20 * 2;
        const width = mesureRowWidth(ctx, item.attributes.name);
        res = Math.max(res, width + iconsWidth + item.level * LEVEL_OFFSET);
    }
    return Math.round(res * 1.05);
};
