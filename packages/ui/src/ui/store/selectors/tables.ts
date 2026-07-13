import {type RootState} from '../../store/reducers';
import {initialState} from '../../store/reducers/tables';

export const selectTables = (state: RootState) => state.tables || initialState;
