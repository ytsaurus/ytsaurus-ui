import {initialState} from '../../store/reducers/tables';

export const getTables = (state = {}) => state.tables || initialState;
