import {type DescribedSettings} from '../../../../shared/constants/settings-types';
import {type RootState} from '../../../store/reducers';

export const selectSettingsData = (state: RootState) =>
    state.settings.data as unknown as DescribedSettings;
