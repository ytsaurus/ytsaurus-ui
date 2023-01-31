export const STACKED_PROGRESS_BAR_COLORS = [
    'var(--red-color)',
    'var(--orange-color)',
    'var(--yellow-color)',
    'var(--pale-yellow-color)',
    'var(--green-color)',
    'var(--cyan-color)',
    'var(--lime-color)',
    'var(--blue-color)',
    'var(--purple-color)',
    'var(--pink-color)',
];

export function getProgressBarColorByIndex(index: number, offset = 4) {
    return STACKED_PROGRESS_BAR_COLORS[(offset + index) % STACKED_PROGRESS_BAR_COLORS.length];
}
