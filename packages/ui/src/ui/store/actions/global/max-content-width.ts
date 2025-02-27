import {GLOBAL_PARTIAL} from '../../../constants/global';
import {GloablStateAction} from '../../../store/reducers/global';

export function setMaxContentWidthEnabled(enableMaxContentWidth: boolean): GloablStateAction {
    return {type: GLOBAL_PARTIAL, data: {enableMaxContentWidth}};
}
