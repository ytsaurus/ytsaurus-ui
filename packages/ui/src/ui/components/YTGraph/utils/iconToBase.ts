import {renderToString} from 'react-dom/server';
import {GRAPH_COLORS} from '../constants';

export const iconToBase = (icon: React.ReactElement, color: string = GRAPH_COLORS.icon) => {
    // @ts-ignore
    const iconString = renderToString(icon).replaceAll('currentColor', color);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconString);
};
