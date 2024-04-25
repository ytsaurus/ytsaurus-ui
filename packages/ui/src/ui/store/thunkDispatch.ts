import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {RootState} from './reducers';
import {useDispatch} from 'react-redux';

export type AppThunkDispatch<T extends AnyAction> = ThunkDispatch<RootState, any, T>;

export const useThunkDispatch = () => useDispatch<AppThunkDispatch<AnyAction>>();
