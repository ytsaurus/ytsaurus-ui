import {RootState} from '../../../store/reducers';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

export const isMaxContentWidthEnabled = (state: RootState) => state.global.enableMaxContentWidth;

export const getMaxContentWidth = (state: RootState) => {
    return getSettingsData(state)['global::maxContentWidth'];
};
