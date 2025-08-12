import compact_ from 'lodash/compact';
import React from 'react';
import YagrChartKit, {
    RawSerieData,
    YagrWidgetData,
    getSerieColor,
} from '../YagrChartKit/YagrChartKit';

import formatLib from '../../common/hammer/format';

export interface HistogramChartProps {
    className: string;
    format: 'Number' | 'Bytes';
    ecdf: ECDFData;
    pdf: PDFData;
    dataName: string;
    lineOnly?: boolean;
}

interface ECDFData {
    min: number;
    max: number;
    steps: Array<XY>;
}

type XY = [X, Y] | {x: X; y: Y};

interface PDFData {
    bucketNumber: number;
    bucketSize: number;
    buckets: Array<[X, Y]>;
    min: X;
    max: X;
}

type X = number;
type Y = number;

function HistogramChart({className, pdf, ecdf, format, dataName, lineOnly}: HistogramChartProps) {
    const yagrData = React.useMemo(() => {
        const xFormat = format === 'Bytes' ? formatLib.Bytes : formatLib.Number;
        const {timeline, graphs, step} = lineOnly
            ? getLineOnlyData(pdf, ecdf)
            : getColumnData(pdf, ecdf);
        const res: YagrWidgetData = {
            data: {
                timeline,
                graphs,
            },
            libraryConfig: {
                axes: {
                    x: {
                        values: (_d, x) => x.map(xFormat),
                        side: 'bottom',
                        grid: {
                            show: false,
                        },
                    },
                    y1: {
                        side: 'right',
                        show: false,
                    },
                    y: {
                        side: 'left',
                        show: false,
                    },
                },
                scales: {
                    y1: {
                        min: 0,
                        max: 100,
                    },
                    y: {
                        min: 0,
                    },
                },
                tooltip: {
                    render: (tooltipData) => {
                        const {
                            x,
                            scales: [first, second],
                        } = tooltipData;
                        const columnValue = lineOnly ? undefined : first?.rows?.[0]?.originalValue;
                        const lineValue = lineOnly
                            ? first?.rows?.[0]?.originalValue
                            : second?.rows?.[0]?.originalValue;

                        return (
                            renderDefaultTooltip({
                                colValue:
                                    columnValue !== undefined
                                        ? formatLib.Number(columnValue)
                                        : undefined,
                                colX0: xFormat(x - step / 2),
                                colX1: xFormat(x + step / 2),
                                lineValue:
                                    lineValue !== undefined
                                        ? formatLib.Number(lineValue, {digits: 2}) + '%'
                                        : undefined,
                                lineX: xFormat(x),
                                dataName,
                                lineOnly,
                            }) ?? '-'
                        );
                    },
                },
            },
            sources: {},
        };
        return res;
    }, [pdf, ecdf, format, lineOnly]);

    return (
        <div className={className}>
            <YagrChartKit type={'yagr'} data={yagrData} />
        </div>
    );
}

export default React.memo(HistogramChart);

function getColumnData(
    {buckets, min, bucketSize}: PDFData,
    {steps}: ECDFData,
): YagrWidgetData['data'] & {step: number} {
    const timeline = [min - 0.1 * bucketSize];
    const data: Array<number> = [undefined!];
    const lineData: Array<number> = [undefined!];
    let j = 0;
    for (let i = 0; i < buckets.length; ++i) {
        const [x, y] = buckets[i];
        const bestX = x + bucketSize / 2;
        data.push(y);
        timeline.push(bestX);
        while (j < steps.length) {
            const item = steps[j];
            const itemX = getX(item);
            if (itemX === bestX) {
                lineData[i + 1] = Array.isArray(item) ? item[1] : item.y;
                break;
            } else if (itemX === undefined || itemX < bestX) {
                ++j;
                continue;
            } else {
                lineData[i + 1] = calcBestY(
                    bestX,
                    steps[Math.min(steps.length - 1, j - 1)],
                    steps[j],
                )!;
                break;
            }
        }
    }
    timeline.push(min + (0.1 + bucketSize) * buckets.length);
    data.push(undefined!);
    lineData.push(undefined!);

    const graphs: RawSerieData[] = [
        {
            type: 'line' as const,
            data: lineData,
            scale: 'y1',
            color: getSerieColor(1),
        },
        {
            type: 'column' as const,
            data,
            color: getSerieColor(0),
            ...{
                renderOptions: {
                    size: [1],
                    gap: 1,
                },
            },
        },
    ];
    return {
        graphs,
        timeline,
        step: bucketSize,
    };
}

function getLineOnlyData(
    {min, buckets, bucketSize}: PDFData,
    {steps}: ECDFData,
): ReturnType<typeof getColumnData> {
    const timeline: Array<number> = [min - 0.1 * bucketSize];
    const data: Array<number> = [NaN];

    for (const item of steps) {
        timeline.push(getX(item)!);
        data.push(getY(item)!);
    }

    timeline.push(min + (0.1 + bucketSize) * buckets.length);
    data.push(NaN);

    const graphs: Array<RawSerieData> = [
        {
            type: 'line' as const,
            data,
            color: getSerieColor(1),
        },
    ];

    return {
        timeline,
        graphs,
        step: NaN,
    };
}

function renderDefaultTooltip({
    colValue,
    colX0,
    colX1,
    lineValue,
    lineX,
    dataName,
    lineOnly,
}: {
    colValue?: string;
    colX0: string;
    colX1: string;
    lineValue?: string;
    lineX: string;
    dataName: string;
    lineOnly?: boolean;
}) {
    const lp = lineOnly ? '' : '~';
    return compact_([
        colValue !== undefined
            ? `<b>${colValue}</b> partitions contain in range from <b>${colX0}</b> to <b>${colX1}</b> - ${dataName}`
            : undefined,
        lineValue !== undefined
            ? `<b>${lp}${lineValue}</b> of tablets contains <b>${lp}${lineX}</b> or less`
            : undefined,
    ]).join('<br/>');
}

function getX(v?: XY) {
    return Array.isArray(v) ? v[0] : v?.x;
}

function getY(v?: XY) {
    return Array.isArray(v) ? v[1] : v?.y;
}

function calcBestY(bestX: number, left?: XY, right?: XY) {
    const ly = getY(left);
    const ry = getY(right);
    if (ly === undefined) {
        return ry;
    }

    if (ry === undefined) {
        return ly;
    }

    const lx = getX(left);
    const rx = getX(right);
    const k = (bestX - lx!) / (rx! - lx!);

    return ly + k * (ry - ly);
}
