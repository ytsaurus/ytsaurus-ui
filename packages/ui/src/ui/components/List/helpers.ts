export function findNextIndex<T>(
    list: T[],
    active: number | undefined,
    index: number,
    step: number,
) {
    const dataLength = list.length;
    let nextIndex = index;
    let direction = step;
    if (nextIndex >= dataLength) {
        nextIndex = dataLength - 1;
        direction = -1;
    } else if (nextIndex < 0) {
        nextIndex = 0;
        direction = 1;
    }
    for (let i = 0; i < dataLength && nextIndex >= 0 && nextIndex < dataLength; i++) {
        const nextValue = list[nextIndex];
        const disabled =
            typeof nextValue === 'object' && nextValue !== null && 'disabled' in nextValue
                ? nextValue.disabled
                : false;
        if (list[nextIndex] && !disabled) {
            return nextIndex;
        }
        nextIndex += direction;
        if ((nextIndex === -1 || nextIndex === dataLength) && active !== undefined) {
            direction = -direction;
            nextIndex = index + direction;
        }
    }
    return undefined;
}
