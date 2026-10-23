import {type RootState} from '../../store/reducers';
import {getWindowStore} from '../../store/window-store';

export function getSettingBySelector<T>(selector: (state: RootState) => T): T {
    const state = getWindowStore().getState();
    return selector(state);
}
