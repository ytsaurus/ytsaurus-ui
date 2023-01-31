import _ from 'lodash';

import {createSelector} from 'reselect';
import {RootState} from '../../reducers';

const getModalErrorsState = (state: RootState) => state.modals.errors;

export const getModalErrors = createSelector([getModalErrorsState], ({errors}) => {
    return _.map(errors, (error, id) => ({id, error}));
});
