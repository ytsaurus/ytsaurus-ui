import {ConfigItemData} from '@gravity-ui/dashkit';

import {NavigationSettingsValues} from '../../Widgets/Navigation/settings';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';

export type SettingsValues =
    | NavigationSettingsValues
    | OperationsSettingsValues
    | ConfigItemData;
