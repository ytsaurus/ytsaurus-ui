import {ConfigItemData} from '@gravity-ui/dashkit';
import type {AccountsWidgetData} from '../../Widgets/Accounts/types';
import {NavigationSettingsValues} from '../../Widgets/Navigation/settings';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';
import {PoolsSettingsValues} from '../../Widgets/Pools/settings';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';
import {ServicesSettingsValues} from '../../Widgets/Services/settings';

export type SettingsValues =
    | AccountsWidgetData
    | NavigationSettingsValues
    | OperationsSettingsValues
    | PoolsSettingsValues
    | QueriesSettingsValues
    | ServicesSettingsValues
    | ConfigItemData;
