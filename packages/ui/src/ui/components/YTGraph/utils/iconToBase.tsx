import React from 'react';

import {renderToString} from 'react-dom/server';
import {GRAPH_COLORS} from '../constants';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

export function svgDataToBase(IconComponent: SVGIconSvgrData, color?: string) {
    return iconToBase(<IconComponent />, color);
}

export const iconToBase = (icon: React.ReactElement, color: string = GRAPH_COLORS.icon) => {
    // @ts-ignore
    const iconString = renderToString(icon).replaceAll('currentColor', color);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconString);
};
