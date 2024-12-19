import {renderToString} from 'react-dom/server';

export const iconToBase = (icon: React.ReactElement, color: string) =>
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(renderToString(icon).replace('currentColor', color));
