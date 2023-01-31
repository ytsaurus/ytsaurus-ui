export const isSystemResourcesLoaded = (state) => {
    const {loaded, nodeAttrsLoaded} = state.system.resources;
    return loaded && nodeAttrsLoaded;
};
