import {RootState} from './reducers';
import {useDispatch as useDispatchBase, useSelector as useSelectorBase} from 'react-redux';
import {AppDispatch} from './store.main';

export const useDispatch = useDispatchBase.withTypes<AppDispatch>();
export const useSelector = useSelectorBase.withTypes<RootState>();
