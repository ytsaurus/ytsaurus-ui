import {UnknownAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {RootState} from './reducers';
import {useDispatch} from 'react-redux';

export type AppThunkDispatch<T extends UnknownAction> = ThunkDispatch<RootState, any, T>;

export const useThunkDispatch = () => useDispatch<AppThunkDispatch<UnknownAction>>();
