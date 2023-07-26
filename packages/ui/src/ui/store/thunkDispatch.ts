import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {RootState} from './reducers';
import {useDispatch} from 'react-redux';

export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;

export const useThunkDispatch = () => useDispatch<AppThunkDispatch>();
