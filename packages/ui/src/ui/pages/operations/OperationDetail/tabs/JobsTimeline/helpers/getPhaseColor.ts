export const getPhaseColor = (state: string, phase?: string) => {
    if (!phase) return state;

    return state.toLowerCase() === 'running' && phase.toLowerCase() !== 'running'
        ? 'running-prev'
        : state;
};
