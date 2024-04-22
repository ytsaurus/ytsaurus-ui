import {Settings} from '../../shared/constants/settings-types';

export const defaultUserSettingsOverrides: Partial<Settings> = {
    ['global::theme']: 'light',
    ['global::navigation::useSmartSort']: false,
    ['global::components::enableSideBar']: true,
    ['global::menu::startingPage']: 'navigation',
} as const;
