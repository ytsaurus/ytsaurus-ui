export const ZOOM_IN_FACTOR = 0.5;
export const ZOOM_OUT_FACTOR = 2;

export const FALLBACK_DURATION = 60 * 1000;

export type ZoomedRangeParams = {
    from: number;
    to: number;
    factor: number;
    minDuration?: number;
    maxDuration?: number;
};

export function calculateZoomedRange({
    from,
    to,
    factor,
    minDuration = 0,
    maxDuration = Number.POSITIVE_INFINITY,
}: ZoomedRangeParams) {
    const duration = to - from;

    const baseDuration = duration > 0 ? duration : Math.max(minDuration, FALLBACK_DURATION);
    const zoomedDuration = Math.min(Math.max(baseDuration * factor, minDuration), maxDuration);
    const delta = Math.round((zoomedDuration - duration) / 2);

    return {from: from - delta, to: to + delta};
}
