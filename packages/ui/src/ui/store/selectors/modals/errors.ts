import map_ from 'lodash/map';

import {createSelector} from 'reselect';
import {type RootState} from '../../reducers';

const selectModalErrorsState = (state: RootState) => state.modals.errors;

export const selectModalErrors = createSelector([selectModalErrorsState], ({errors}) => {
    return map_(errors, (error, id) => ({id, error}));
});
