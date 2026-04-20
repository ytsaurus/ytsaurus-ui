import {type RootState} from './reducers';
import {useDispatch as useDispatchBase, useSelector as useSelectorBase} from 'react-redux';
import {type AppDispatch} from './store.main';

export const useDispatch = useDispatchBase.withTypes<AppDispatch>();
export const useSelector = useSelectorBase.withTypes<RootState>();
