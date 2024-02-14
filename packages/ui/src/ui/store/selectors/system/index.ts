import {RootState} from '../../reducers';

export const isSystemResourcesLoaded = (state: RootState) => {
    const {loaded, nodeAttrsLoaded} = state.system.resources;
    return loaded && nodeAttrsLoaded;
};
