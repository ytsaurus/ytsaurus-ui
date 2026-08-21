export const ZOOM_IN_FACTOR = 0.5;
export const ZOOM_OUT_FACTOR = 2;

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
    maxDuration = Number.MAX_SAFE_INTEGER,
}: ZoomedRangeParams) {
    const duration = to - from;

    if (duration <= 0) {
        throw new Error(
            `calculateZoomedRange: expected a positive duration, got from=${from}, to=${to}`,
        );
    }

    const zoomedDuration = Math.min(Math.max(duration * factor, minDuration), maxDuration);
    const delta = Math.round((zoomedDuration - duration) / 2);

    return {from: from - delta, to: to + delta};
}
