import {type RootState} from '../../../store/reducers';
import {selectSettingsData} from '../../../store/selectors/settings/settings-base';

export const selectIsMaxContentWidthEnabled = (state: RootState) =>
    state.global.enableMaxContentWidth;

export const selectMaxContentWidth = (state: RootState) => {
    return selectSettingsData(state)['global::maxContentWidth'];
};
