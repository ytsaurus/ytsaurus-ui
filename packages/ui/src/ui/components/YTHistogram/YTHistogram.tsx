import React from 'react';
import cn from 'bem-cn-lite';

import YagrChartKit, {
    RawSerieData,
    YagrWidgetData,
    getSerieColor,
} from '../YagrChartKit/YagrChartKit';
import './YTHistogram.scss';

import format from '../../common/hammer/format';

const block = cn('yt-histogram');

export interface YTHistorgramData {
    min: number;
    max: number;
    count: Array<number>;
}

export interface AxisInfo {
    label?: string;
}

export interface YTHistogramProps {
    className?: string;
    xLabel?: string;
    yLabel?: string;
    yLogarithmic?: boolean;
    yMin?: number;
    xFormat?: (v?: number | string | null) => string;
    yFormat?: (v?: number | string | null) => string;
    renderTooltip?: (value: string | undefined, xl: string, xr: string) => string;
    data: YTHistorgramData;
}

function YTHistogram({
    className,
    data,
    xLabel,
    yLabel,
    yLogarithmic,
    yMin,
    xFormat = format.Number,
    yFormat = format.Number,
    renderTooltip = renderDefaultTooltip,
}: YTHistogramProps) {
    const yagrData = React.useMemo(() => {
        const {timeline, serieData, step} = genYagrData(data);
        const graphs: Array<RawSerieData> = [
            {
                type: 'column' as const,
                data: yLogarithmic ? serieData.map((v) => (v === 0 ? NaN : v)) : (serieData as any),
                color: getSerieColor(0),
                formatter: yFormat,
                ...{
                    renderOptions: {
                        size: [1],
                        gap: 1,
                    },
                },
            },
        ];

        const res: YagrWidgetData = {
            data: {
                timeline,
                graphs,
            },
            libraryConfig: {
                axes: {
                    x: {
                        label: xLabel,
                        values: (_d: unknown, x: Array<any>) => x.map(xFormat),
                    },
                    y: {
                        label: yLabel,
                    },
                },
                scales: {
                    y: {
                        min: yMin,
                        type: yLogarithmic ? 'logarithmic' : 'linear',
                    },
                },
                tooltip: {
                    render: (tooltipData) => {
                        const {
                            x,
                            scales: [
                                {
                                    rows: [row],
                                },
                            ],
                        } = tooltipData;

                        const {originalValue} = row;

                        return (
                            renderTooltip(
                                yFormat(isNaN(originalValue!) ? 0 : originalValue),
                                xFormat(x - step / 2),
                                xFormat(x + step / 2),
                            ) ?? '-'
                        );
                    },
                },
            },
        };
        return res;
    }, [data, xLabel, yLabel, xFormat, yFormat, renderTooltip, yMin, yLogarithmic]);

    return (
        <div className={block(null, className)}>
            <YagrChartKit type={'yagr'} data={yagrData} />
        </div>
    );
}

export default React.memo(YTHistogram);

function genYagrData({min, max, count}: YTHistorgramData) {
    const step = min === max ? 1 : (max - min) / Math.max(count.length, 1);

    const serieData = [undefined, ...count];
    const timeline = [min - step / 2];
    if (count.length > 1) {
        for (let i = 0; i < count.length; ++i) {
            timeline.push(min + i * step + step / 2);
        }
    } else {
        timeline.push(min);
    }
    timeline.push(max + step / 2);
    serieData.push(undefined);

    return {timeline, serieData, step: min === max ? 0 : step};
}

const renderDefaultTooltip: Required<YTHistogramProps>['renderTooltip'] = (y, x0, x1) => {
    return `<b>${y}</b> for range from <b>${x0}</b> to <b>${x1}</b>`;
};

export function calculateFormatSettings(
    data: YTHistorgramData | undefined,
    fmtFn: (v: number, opts?: {digits?: number}) => number,
) {
    const {min, max} = data ?? {};
    if (min === max || min === undefined || max === undefined) {
        return undefined;
    }
    const v2 = min + (max - min) / 10;
    if (fmtFn(min) !== fmtFn(v2)) {
        return undefined;
    }
    for (let i = 0; i < 5; ++i) {
        const opts = {digits: i + 2};
        const s1 = fmtFn(min, opts);
        const s2 = fmtFn(v2, opts);
        if (s1 !== s2) {
            return {digits: i + 3};
        }
    }
    return undefined;
}
