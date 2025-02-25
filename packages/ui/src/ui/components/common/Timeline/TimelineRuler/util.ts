interface Interval {
    start: number;
    end: number;
}
interface ZoomIntervalOptions {
    maxRange?: number;
    minRange?: number;
    ratio?: number;
    multiplier: number;
}
export function zoomInterval(
    {start, end}: Interval,
    {multiplier, ratio = 0.5, maxRange, minRange}: ZoomIntervalOptions,
): Interval {
    let range = end - start;
    const middle = start * (1 - ratio) + end * ratio;
    if (multiplier > 1) {
        range = maxRange ? Math.min(range * multiplier, maxRange) : range * multiplier;
    } else {
        range = minRange ? Math.max(range * multiplier, minRange) : range * multiplier;
    }

    const newStart = Math.round(middle - range * ratio);
    const newEnd = Math.round(middle + range * (1 - ratio));

    return {
        start: newStart,
        end: newEnd,
    };
}
