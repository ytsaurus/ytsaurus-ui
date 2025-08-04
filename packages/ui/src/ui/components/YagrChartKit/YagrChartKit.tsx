import ChartKit, {settings} from '@gravity-ui/chartkit';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
export type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import '@gravity-ui/yagr/dist/index.css';

settings.set({plugins: [YagrPlugin]});

const COLORS = [
    'var(--g-color-line-info)',
    'var(--g-color-line-danger)',
    'var(--g-color-line-positive)',
    'var(--g-color-line-warning)',
    'var(--g-color-line-utility)',
    'var(--g-color-line-misc)',
];

export function getSerieColor(serieIndex: number) {
    return COLORS[serieIndex % COLORS.length];
}

export default ChartKit;
