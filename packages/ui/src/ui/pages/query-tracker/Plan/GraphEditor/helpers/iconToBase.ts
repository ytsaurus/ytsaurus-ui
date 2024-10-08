import {renderToString} from 'react-dom/server';

export const iconToBase = (icon: React.ReactElement, color: string) => {
    // @ts-ignore
    const iconString = renderToString(icon).replaceAll('currentColor', color);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconString);
};
