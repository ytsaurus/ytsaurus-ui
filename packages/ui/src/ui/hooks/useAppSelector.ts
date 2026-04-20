import {type TypedUseSelectorHook, useSelector} from 'react-redux';
import {type StoreType} from '../store/store.main';
export const useAppSelector: TypedUseSelectorHook<StoreType> = useSelector;
