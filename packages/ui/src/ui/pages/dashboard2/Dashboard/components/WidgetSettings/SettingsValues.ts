import {ConfigItemData} from '@gravity-ui/dashkit';
import {AccountsSettingsValues} from '../../Widgets/Accounts/settings';
import {NavigationSettingsValues} from '../../Widgets/Navigation/settings';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';
import {PoolsSettingsValues} from '../../Widgets/Pools/settings';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';
import {ServicesSettingsValues} from '../../Widgets/Services/settings';

export type SettingsValues =
    | AccountsSettingsValues
    | NavigationSettingsValues
    | OperationsSettingsValues
    | PoolsSettingsValues
    | QueriesSettingsValues
    | ServicesSettingsValues
    | ConfigItemData;
