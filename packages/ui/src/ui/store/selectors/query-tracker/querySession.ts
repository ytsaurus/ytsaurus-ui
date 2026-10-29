import type {RootState} from '../../reducers';

export const selectQuerySessionRevision = (state: RootState) =>
    state.queryTracker.query.sessionRevision;
