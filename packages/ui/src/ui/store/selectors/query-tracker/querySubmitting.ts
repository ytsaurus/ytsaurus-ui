import type {RootState} from '../../reducers';

export const selectQuerySubmitting = (state: RootState) => {
    const query = state.queryTracker.query;
    return (
        query.submittingRevision !== undefined && query.submittingRevision === query.sessionRevision
    );
};
