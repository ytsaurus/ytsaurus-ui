import {type DescribedSettings} from '../../../../shared/constants/settings-types';
import {type RootState} from '../../../store/reducers';

export const getSettingsData = (state: RootState) =>
    state.settings.data as unknown as DescribedSettings;
