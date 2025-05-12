import {ConfigItemData} from '@gravity-ui/dashkit';
import {AccountsSettingsValues} from '../../Widgets/Accounts/settings';
import {NavigationSettingsValues} from '../../Widgets/Navigation/settings';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';
import {PoolsSettingsValues} from '../../Widgets/Pools/settings';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';

export type SettingsValues =
    | AccountsSettingsValues
    | NavigationSettingsValues
    | OperationsSettingsValues
    | PoolsSettingsValues
    | QueriesSettingsValues
    | ConfigItemData;
