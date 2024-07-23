import map_ from 'lodash/map';

import {createSelector} from 'reselect';
import {RootState} from '../../reducers';

const getModalErrorsState = (state: RootState) => state.modals.errors;

export const getModalErrors = createSelector([getModalErrorsState], ({errors}) => {
    return map_(errors, (error, id) => ({id, error}));
});
