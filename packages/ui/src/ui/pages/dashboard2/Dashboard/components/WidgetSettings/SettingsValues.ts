import {ConfigItemData} from '@gravity-ui/dashkit';

import {AccountsSettingsValues} from '../../Widgets/Accounts/settings';
import {NavigationSettingsValues} from '../../Widgets/Navigation/settings';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';

export type SettingsValues =
    | AccountsSettingsValues
    | NavigationSettingsValues
    | OperationsSettingsValues
    | ConfigItemData;
