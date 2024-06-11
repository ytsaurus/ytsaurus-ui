import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {StoreType} from '../store/store.main';
export const useAppSelector: TypedUseSelectorHook<StoreType> = useSelector;
