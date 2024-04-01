import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {StoreType} from '../store';
export const useAppSelector: TypedUseSelectorHook<StoreType> = useSelector;
