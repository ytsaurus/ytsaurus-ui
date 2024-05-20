import {RootState} from '../../store/reducers';
import {initialState} from '../../store/reducers/tables';

export const getTables = (state: RootState) => state.tables || initialState;
